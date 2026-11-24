import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markStripeSessionPaid } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Called by the checkout page when Stripe sends the customer back with
// ?payment_success=true&session_id=cs_... . The session is verified with
// Stripe server-side, so this can't be faked from the browser. Works even if
// the Stripe webhook isn't configured; the webhook remains the backup for
// customers who close the tab before returning.
export async function POST(request) {
  try {
    const { sessionId } = await request.json().catch(() => ({}));
    if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ paid: false, status: session.status }, { status: 200 });
    }

    const order = await markStripeSessionPaid(session);
    if (!order) return NextResponse.json({ paid: true, order: null });

    return NextResponse.json({
      paid: true,
      order: {
        orderNumber: order.orderNumber,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        tax: Number(order.tax),
        total: Number(order.total),
      },
    });
  } catch (err) {
    if (err?.code === "resource_missing") {
      return NextResponse.json({ error: "Unknown checkout session" }, { status: 404 });
    }
    console.error("[checkout confirm]", err.message);
    return NextResponse.json({ error: "Could not confirm payment" }, { status: 502 });
  }
}
