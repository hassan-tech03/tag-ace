import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminRoute, notFound } from "@/lib/api";
import { db, categories } from "@/lib/db";
import { isUuid, serialize } from "@/lib/db/helpers";
import { categoryUpdateSchema } from "@/lib/validation";
import { STORE_CATEGORIES } from "@/lib/storefrontCategories";

const STORE_SLUGS = new Set(STORE_CATEGORIES.map((c) => c.slug));

async function findById(id) {
  if (!isUuid(id)) return null;
  const [row] = await db.select().from(categories).where(eq(categories.id, id));
  return row || null;
}

export const GET = adminRoute(async (_req, { params }) => {
  const row = await findById(params.id);
  if (!row) return notFound();
  return NextResponse.json(serialize(row));
});

export const PATCH = adminRoute(async (request, { params }) => {
  const existing = await findById(params.id);
  if (!existing) return notFound();
  const body = await request.json();
  const data = categoryUpdateSchema.parse(body);
  if (data.slug) data.slug = data.slug.toLowerCase();
  // Built-in categories back the /shop/<slug> routes; renaming the slug
  // would orphan the page and every product filed under it.
  if (STORE_SLUGS.has(existing.slug) && data.slug && data.slug !== existing.slug) {
    return NextResponse.json(
      { error: "The slug of a built-in storefront category can't be changed." },
      { status: 400 }
    );
  }
  if (Object.keys(data).length === 0) return NextResponse.json(serialize(existing));
  const [row] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, params.id))
    .returning();
  return NextResponse.json(serialize(row));
});

export const DELETE = adminRoute(async (_req, { params }) => {
  const existing = await findById(params.id);
  if (!existing) return notFound();
  if (STORE_SLUGS.has(existing.slug)) {
    return NextResponse.json(
      {
        error:
          "This category is built into the storefront and cannot be deleted. You can hide it by toggling Active off instead.",
      },
      { status: 400 }
    );
  }
  await db.delete(categories).where(eq(categories.id, params.id));
  return NextResponse.json({ ok: true });
});
