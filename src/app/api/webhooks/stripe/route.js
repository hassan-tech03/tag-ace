import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/lib/models/Order";

// Stripe webhook receiver. Configure the endpoint in the Stripe dashboard
// (or `stripe listen --forward-to localhost:3000/api/webhooks/stripe` in dev)
// and put the signing secret into STRIPE_WEBHOOK_SECRET.
export const runtime = "nodejs";

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeKey) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[stripe webhook] signature verification failed:", err.message);
    }
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await dbConnect();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        const update = {
          paymentStatus: "paid",
          status: "processing",
          stripePaymentIntentId: session.payment_intent || "",
          stripeSessionId: session.id,
        };
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, update);
        } else {
          // Fallback: locate by session id if metadata is missing.
          await Order.findOneAndUpdate({ stripeSessionId: session.id }, update);
        }
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "failed",
            status: "cancelled",
          });
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = charge.payment_intent;
        if (pi) {
          await Order.findOneAndUpdate(
            { stripePaymentIntentId: pi },
            { paymentStatus: "refunded" }
          );
        }
        break;
      }
      default:
        // Unhandled events are fine — Stripe will retry only on non-2xx.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[stripe webhook] handler error:", err);
    }
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
