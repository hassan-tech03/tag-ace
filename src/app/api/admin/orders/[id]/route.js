import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminRoute, notFound } from "@/lib/api";
import { db, orders } from "@/lib/db";
import { isUuid, serializeOrder } from "@/lib/db/helpers";
import { orderAdminUpdateSchema } from "@/lib/validation";

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

  const [row] = await db.update(orders).set(data).where(eq(orders.id, params.id)).returning();
  if (!row) return notFound();
  return NextResponse.json(serializeOrder(row));
});
