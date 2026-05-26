import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import Product from "@/lib/models/Product";
import { productCreateSchema } from "@/lib/validation";

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, sp } = parseListParams(request.url);
  const category = sp.get("category")?.trim();
  const status = sp.get("status")?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }
  if (category) filter.category = category.toLowerCase();
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
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
  const data = productCreateSchema.parse(body);
  data.slug = data.slug.toLowerCase();
  if (data.category) data.category = data.category.toLowerCase();
  const doc = await Product.create(data);
  return NextResponse.json(doc, { status: 201 });
});
