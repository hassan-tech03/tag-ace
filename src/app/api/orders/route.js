import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { orderCreateSchema } from "@/lib/validation";
import { computeTotals, generateOrderNumber } from "@/lib/orderUtils";
import { handleError } from "@/lib/api";

// Public endpoint called by the storefront checkout. Persists an Order in
// Mongo and, for Stripe orders, also creates a Checkout Session so the
// storefront can redirect to Stripe in a single round trip.
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const data = orderCreateSchema.parse(body);

    // Recompute totals on the server. Never trust client-side totals.
    const totals = computeTotals(data.items);
    if (totals.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      items: totals.items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "cod" ? "cod_pending" : "pending",
      status: data.paymentMethod === "cod" ? "processing" : "pending",
      customer: data.customer,
      shippingAddress: data.shippingAddress || {},
      billingAddress: data.billingAddress || data.shippingAddress || {},
      customerNotes: data.customerNotes || "",
    });

    if (data.paymentMethod === "cod") {
      return NextResponse.json({
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        redirect: "/order-confirmation",
      });
    }

    // Stripe path -----------------------------------------------------------
    if (!process.env.STRIPE_SECRET_KEY) {
      // Roll back: order shouldn't sit there if we can't take payment.
      await Order.deleteOne({ _id: order._id });
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const lineItems = totals.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (totals.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(totals.shipping * 100),
        },
        quantity: 1,
      });
    }
    if (totals.tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax (8%)" },
          unit_amount: Math.round(totals.tax * 100),
        },
        quantity: 1,
      });
    }

    const domain = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${domain}/checkout?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/checkout?payment_cancelled=true`,
      customer_email: data.customer.email,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US"] },
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return NextResponse.json({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      total: order.total,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    return handleError(err);
  }
}
