import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminRoute, notFound } from "@/lib/api";
import { db, products } from "@/lib/db";
import { isUuid, serialize } from "@/lib/db/helpers";
import { productUpdateSchema } from "@/lib/validation";

export const GET = adminRoute(async (_req, { params }) => {
  if (!isUuid(params.id)) return notFound();
  const [row] = await db.select().from(products).where(eq(products.id, params.id));
  if (!row) return notFound();
  return NextResponse.json(serialize(row));
});

export const PATCH = adminRoute(async (request, { params }) => {
  if (!isUuid(params.id)) return notFound();
  const body = await request.json();
  const data = productUpdateSchema.parse(body);
  if (data.slug) data.slug = data.slug.toLowerCase();
  if (data.category) data.category = data.category.toLowerCase();
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  const [row] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, params.id))
    .returning();
  if (!row) return notFound();
  return NextResponse.json(serialize(row));
});

export const DELETE = adminRoute(async (_req, { params }) => {
  if (!isUuid(params.id)) return notFound();
  const [row] = await db
    .delete(products)
    .where(eq(products.id, params.id))
    .returning({ id: products.id });
  if (!row) return notFound();
  return NextResponse.json({ ok: true });
});
