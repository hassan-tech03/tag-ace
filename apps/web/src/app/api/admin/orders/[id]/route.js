import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { adminRoute, notFound } from "@/lib/api";
import { db, orders } from "@mushk/db";
import { isUuid, serializeOrder } from "@mushk/db/helpers";
import { orderAdminUpdateSchema } from "@/lib/validation";
import { sendOrderDeliveredEmail } from "@/lib/email";

export const GET = adminRoute(async (_req, { params }) => {
  if (!isUuid(params.id)) return notFound();
  const [row] = await db.select().from(orders).where(eq(orders.id, params.id));
  if (!row) return notFound();
  return NextResponse.json(serializeOrder(row));
});

export const PATCH = adminRoute(async (request, { params }) => {
  if (!isUuid(params.id)) return notFound();
  const data = orderAdminUpdateSchema.parse(await request.json());

  // Track cancellation timestamp automatically.
  if (data.status === "cancelled") data.cancelledAt = new Date();

  let row;
  let justDelivered = false;
  if (data.status === "delivered") {
    // Only the update that moves the order INTO "delivered" stamps the date
    // and triggers the customer email (saving again won't resend it).
    [row] = await db
      .update(orders)
      .set({ ...data, deliveredAt: new Date() })
      .where(and(eq(orders.id, params.id), ne(orders.status, "delivered")))
      .returning();
    justDelivered = Boolean(row);
  }
  if (!row) {
    [row] = await db.update(orders).set(data).where(eq(orders.id, params.id)).returning();
  }
  if (!row) return notFound();

  if (justDelivered) void sendOrderDeliveredEmail(row);
  return NextResponse.json({ ...serializeOrder(row), deliveredEmailSent: justDelivered });
});
