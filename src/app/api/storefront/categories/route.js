import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { mapCategoryToStorefront } from "@/lib/storefront/adapter";
import { ensureStoreCategories } from "@/lib/seedStoreCategories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    await ensureStoreCategories();
    const docs = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    return NextResponse.json({ items: docs.map(mapCategoryToStorefront) });
  } catch (err) {
    console.error("[storefront categories]", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
