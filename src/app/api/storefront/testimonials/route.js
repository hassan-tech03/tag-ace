import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { db, testimonials } from "@/lib/db";
import { mapTestimonialToStorefront } from "@/lib/storefront/adapter";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") || "12", 10) || 12));
    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(asc(testimonials.order), desc(testimonials.createdAt))
      .limit(limit);
    return NextResponse.json({ items: rows.map(mapTestimonialToStorefront) });
  } catch (err) {
    console.error("[storefront testimonials]", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
