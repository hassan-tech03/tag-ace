import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { mapProductToStorefront } from "@/lib/storefront/adapter";

// Reads request.url for filters; must run per-request.
export const dynamic = "force-dynamic";

// Public, read-only. Returns products in the storefront-shape so client pages
// can drop them straight into ProductCard. Only "active" products are
// exposed.
export async function GET(request) {
  try {
    await dbConnect();
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

    const filter = { status: "active" };
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    if (badge) filter.badge = { $regex: `^${badge}$`, $options: "i" };
    if (hotDeal === "true") filter.isHotDeal = true;
    if (newArrival === "true") filter.isNewArrival = true;
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      filter.price = {};
      if (Number.isFinite(minPrice)) filter.price.$gte = minPrice;
      if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice;
    }
    if (availability === "in-stock") filter.stock = { $gt: 0 };
    if (availability === "out-of-stock") filter.stock = { $lte: 0 };

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const items = docs.map(mapProductToStorefront);
    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
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
