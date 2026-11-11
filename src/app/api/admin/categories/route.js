import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, categories } from "@/lib/db";
import { buildOrderBy, countAll, pageResult, searchAny, serialize } from "@/lib/db/helpers";
import { categoryCreateSchema } from "@/lib/validation";
import { ensureStoreCategories } from "@/lib/seedStoreCategories";

const SORT_COLUMNS = {
  order: categories.order,
  name: categories.name,
  slug: categories.slug,
  createdAt: categories.createdAt,
};

export const GET = adminRoute(async (request) => {
  // Make sure the canonical storefront categories always show up here,
  // even on a fresh DB. They map 1:1 to the live store URLs.
  await ensureStoreCategories();

  const { page, limit, skip, search, sort, defaultSort } = parseListParams(request.url, {
    defaultSort: "order name",
  });

  const filter = searchAny(search, [categories.name, categories.slug]);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(filter)
      .orderBy(...buildOrderBy(sort, SORT_COLUMNS, defaultSort))
      .limit(limit)
      .offset(skip),
    db.select({ count: countAll }).from(categories).where(filter),
  ]);

  return NextResponse.json(pageResult(rows.map(serialize), count, page, limit));
});

export const POST = adminRoute(async (request) => {
  const body = await request.json();
  const data = categoryCreateSchema.parse(body);
  data.slug = data.slug.toLowerCase();
  const [row] = await db.insert(categories).values(data).returning();
  return NextResponse.json(serialize(row), { status: 201 });
});
