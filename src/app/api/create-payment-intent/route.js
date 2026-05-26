import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { computeTotals, generateOrderNumber } from "@/lib/orderUtils";

// Legacy endpoint used by the existing CheckoutClient.jsx. Behaviour preserved
// for the storefront (still returns { sessionId, url }) but now also persists
// a pending Order so the admin panel can see it, and embeds the order id in
// the Stripe session metadata for the webhook to mark as paid.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request) {
  try {
    const { items, customerInfo, total } = await request.json();

    // Server-side totals (don't trust client). `total` from the body is
    // ignored except as a sanity check in logs.
    const totals = computeTotals(items || []);
    if (totals.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Map the storefront's formData shape onto our Order schema.
    const info = customerInfo || {};
    const shippingAddress = {
      line1: info.address || "",
      line2: info.apartment || "",
      city: info.city || "",
      state: info.state || "",
      country: info.country || "",
      zipCode: info.zipCode || "",
    };
    const billingAddress = info.sameAsShipping
      ? shippingAddress
      : {
          line1: info.billingAddress || "",
          line2: info.billingApartment || "",
          city: info.billingCity || "",
          state: info.billingState || "",
          country: info.billingCountry || "",
          zipCode: info.billingZipCode || "",
        };

    await dbConnect();
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      items: totals.items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      status: "pending",
      customer: {
        email: info.email || "",
        firstName: info.firstName || "",
        lastName: info.lastName || "",
        phone: info.phone || "",
      },
      shippingAddress,
      billingAddress,
      customerNotes: info.specialInstructions || "",
    });

    // Stripe requires absolute http(s) URLs for product_data.images, and
    // localhost URLs aren't reachable from Stripe's CDN. We normalise:
    //   - keep https URLs as-is (Cloudinary, etc.)
    //   - drop everything else so Stripe falls back to its built-in placeholder
    const isPublicImage = (url) =>
      typeof url === "string" && /^https:\/\//i.test(url);

    const lineItems = totals.items.map((item) => {
      const productData = {
        name: item.name,
        description: "MUSHK • 100ML",
      };
      if (isPublicImage(item.image)) {
        productData.images = [item.image];
      }
      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (totals.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping", description: "Standard shipping" },
          unit_amount: Math.round(totals.shipping * 100),
        },
        quantity: 1,
      });
    }
    if (totals.tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax", description: "Sales tax (8%)" },
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
      customer_email: info.email,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US"] },
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: `${info.firstName || ""} ${info.lastName || ""}`.trim(),
        customerPhone: info.phone || "",
        orderType: "perfume_order",
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    // Always log so production logs aren't silent on payment failures.
    console.error("[create-payment-intent]", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
