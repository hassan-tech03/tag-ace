import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, categories } from "@/lib/db";
import { mapCategoryToStorefront } from "@/lib/storefront/adapter";
import { ensureStoreCategories } from "@/lib/seedStoreCategories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureStoreCategories();
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.order), asc(categories.name));
    return NextResponse.json({ items: rows.map(mapCategoryToStorefront) });
  } catch (err) {
    console.error("[storefront categories]", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
