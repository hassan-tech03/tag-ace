import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, products } from "@/lib/db";
import { buildOrderBy, countAll, pageResult, searchAny, serialize, where } from "@/lib/db/helpers";
import { productCreateSchema } from "@/lib/validation";

const PRODUCT_SORT_COLUMNS = {
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
  name: products.name,
  price: products.price,
  stock: products.stock,
  rating: products.rating,
  status: products.status,
};

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, defaultSort, sp } = parseListParams(request.url);
  const category = sp.get("category")?.trim();
  const status = sp.get("status")?.trim();

  const filter = where(
    searchAny(search, [products.name, products.brand, products.sku, products.slug]),
    category ? eq(products.category, category.toLowerCase()) : undefined,
    status ? eq(products.status, status) : undefined
  );

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(products)
      .where(filter)
      .orderBy(...buildOrderBy(sort, PRODUCT_SORT_COLUMNS, defaultSort))
      .limit(limit)
      .offset(skip),
    db.select({ count: countAll }).from(products).where(filter),
  ]);

  return NextResponse.json(pageResult(rows.map(serialize), count, page, limit));
});

export const POST = adminRoute(async (request) => {
  const body = await request.json();
  const data = productCreateSchema.parse(body);
  data.slug = data.slug.toLowerCase();
  if (data.category) data.category = data.category.toLowerCase();
  const [row] = await db.insert(products).values(data).returning();
  return NextResponse.json(serialize(row), { status: 201 });
});
