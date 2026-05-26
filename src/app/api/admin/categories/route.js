import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import Category from "@/lib/models/Category";
import { categoryCreateSchema } from "@/lib/validation";
import { ensureStoreCategories } from "@/lib/seedStoreCategories";

export const GET = adminRoute(async (request) => {
  // Make sure the canonical storefront categories always show up here,
  // even on a fresh DB. They map 1:1 to the live store URLs.
  await ensureStoreCategories();

  const { page, limit, skip, search, sort } = parseListParams(request.url, {
    defaultSort: "order name",
  });

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

export const POST = adminRoute(async (request) => {
  const body = await request.json();
  const data = categoryCreateSchema.parse(body);
  data.slug = data.slug.toLowerCase();
  const doc = await Category.create(data);
  return NextResponse.json(doc, { status: 201 });
});
