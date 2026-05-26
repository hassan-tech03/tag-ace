import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Product from "@/lib/models/Product";
import { productUpdateSchema } from "@/lib/validation";

export const GET = adminRoute(async (_req, { params }) => {
  const doc = await Product.findById(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const PATCH = adminRoute(async (request, { params }) => {
  const body = await request.json();
  const data = productUpdateSchema.parse(body);
  if (data.slug) data.slug = data.slug.toLowerCase();
  if (data.category) data.category = data.category.toLowerCase();
  const doc = await Product.findByIdAndUpdate(params.id, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const DELETE = adminRoute(async (_req, { params }) => {
  const doc = await Product.findByIdAndDelete(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
});
