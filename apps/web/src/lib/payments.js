import { and, eq, ne } from "drizzle-orm";
import { db, orders } from "@mushk/db";
import { isUuid } from "@mushk/db/helpers";
import { sendOrderEmails } from "@/lib/email";

// Marks the order behind a paid Stripe Checkout Session as paid and sends the
// order emails. Safe to call more than once (webhook + return page + retries):
// only the call that flips the order to "paid" sends emails.
// Returns the order row (whether or not this call updated it), or null.
export async function markStripeSessionPaid(session) {
  if (!session || session.payment_status !== "paid") return null;

  const orderId = session.metadata?.orderId;
  const match = isUuid(orderId) ? eq(orders.id, orderId) : eq(orders.stripeSessionId, session.id);

  const [updated] = await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      status: "processing",
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "",
      stripeSessionId: session.id,
    })
    .where(and(match, ne(orders.paymentStatus, "paid")))
    .returning();

  if (updated) {
    await sendOrderEmails(updated);
    return updated;
  }
  const [existing] = await db.select().from(orders).where(match);
  return existing || null;
}
