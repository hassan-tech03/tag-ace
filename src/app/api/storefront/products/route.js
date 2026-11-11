import { NextResponse } from "next/server";
import { eq, gt, gte, ilike, lte } from "drizzle-orm";
import { db, products } from "@/lib/db";
import { buildOrderBy, countAll, pageResult, searchAny, where } from "@/lib/db/helpers";
import { mapProductToStorefront } from "@/lib/storefront/adapter";

// Reads request.url for filters; must run per-request.
export const dynamic = "force-dynamic";

const SORT_COLUMNS = {
  createdAt: products.createdAt,
  name: products.name,
  price: products.price,
  rating: products.rating,
  reviewCount: products.reviewCount,
};

// Public, read-only. Returns products in the storefront-shape so client pages
// can drop them straight into ProductCard. Only "active" products are
// exposed.
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "24", 10) || 24));
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const category = sp.get("category")?.trim();
    const search = sp.get("search")?.trim();
    const badge = sp.get("badge")?.trim();
    const hotDeal = sp.get("hotDeal");
    const newArrival = sp.get("newArrival");
    const minPrice = parseFloat(sp.get("minPrice") || "");
    const maxPrice = parseFloat(sp.get("maxPrice") || "");
    const availability = sp.get("availability")?.trim();
    const sort = sp.get("sort") || "-createdAt";

    const filter = where(
      eq(products.status, "active"),
      // Exact slug match: "men" must not also match "women".
      category ? eq(products.category, category.toLowerCase()) : undefined,
      searchAny(search, [products.name, products.description, products.brand]),
      badge ? ilike(products.badge, badge.replace(/[\\%_]/g, (c) => `\\${c}`)) : undefined,
      hotDeal === "true" ? eq(products.isHotDeal, true) : undefined,
      newArrival === "true" ? eq(products.isNewArrival, true) : undefined,
      Number.isFinite(minPrice) ? gte(products.price, minPrice) : undefined,
      Number.isFinite(maxPrice) ? lte(products.price, maxPrice) : undefined,
      availability === "in-stock" ? gt(products.stock, 0) : undefined,
      availability === "out-of-stock" ? lte(products.stock, 0) : undefined
    );

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(products)
        .where(filter)
        .orderBy(...buildOrderBy(sort, SORT_COLUMNS, "-createdAt"))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ count: countAll }).from(products).where(filter),
    ]);

    return NextResponse.json(pageResult(rows.map(mapProductToStorefront), count, page, limit));
  } catch (err) {
    console.error("[storefront products]", err);
    // Never break the storefront - return an empty list and let the page
    // fall back to its hardcoded data.
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 0, totalPages: 1, error: "ok" },
      { status: 200 }
    );
  }
}
