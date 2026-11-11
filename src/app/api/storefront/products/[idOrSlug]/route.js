import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, products } from "@/lib/db";
import { isUuid } from "@/lib/db/helpers";
import { mapProductToStorefront } from "@/lib/storefront/adapter";

export const dynamic = "force-dynamic";

// Resolves by UUID or slug. Returns 404 when the product doesn't exist or
// isn't published - the storefront page renders the "Product Not Found" view
// in that case.
export async function GET(_req, { params }) {
  try {
    const key = decodeURIComponent(params.idOrSlug || "");
    const match = isUuid(key) ? eq(products.id, key) : eq(products.slug, key.toLowerCase());
    const [row] = await db
      .select()
      .from(products)
      .where(and(match, eq(products.status, "active")))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapProductToStorefront(row));
  } catch (err) {
    console.error("[storefront product detail]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
