import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Category from "@/lib/models/Category";
import { categoryUpdateSchema } from "@/lib/validation";
import { STORE_CATEGORIES } from "@/lib/storefrontCategories";

const STORE_SLUGS = new Set(STORE_CATEGORIES.map((c) => c.slug));

export const GET = adminRoute(async (_req, { params }) => {
  const doc = await Category.findById(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const PATCH = adminRoute(async (request, { params }) => {
  const body = await request.json();
  const data = categoryUpdateSchema.parse(body);
  if (data.slug) data.slug = data.slug.toLowerCase();
  const doc = await Category.findByIdAndUpdate(params.id, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const DELETE = adminRoute(async (_req, { params }) => {
  const existing = await Category.findById(params.id).lean();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (STORE_SLUGS.has(existing.slug)) {
    return NextResponse.json(
      {
        error:
          "This category is built into the storefront and cannot be deleted. You can hide it by toggling Active off instead.",
      },
      { status: 400 }
    );
  }
  await Category.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
});
