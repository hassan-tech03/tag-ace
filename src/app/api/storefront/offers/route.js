import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { db, offers } from "@/lib/db";
import { where } from "@/lib/db/helpers";
import { activeOfferFilter } from "@/lib/db/queries";
import { mapOfferToStorefront } from "@/lib/storefront/adapter";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const type = sp.get("type")?.trim();
    const limit = Math.min(20, Math.max(1, parseInt(sp.get("limit") || "10", 10) || 10));

    const rows = await db
      .select()
      .from(offers)
      .where(where(activeOfferFilter(), type ? eq(offers.type, type) : undefined))
      .orderBy(asc(offers.order), desc(offers.createdAt))
      .limit(limit);
    return NextResponse.json({ items: rows.map(mapOfferToStorefront) });
  } catch (err) {
    console.error("[storefront offers]", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
