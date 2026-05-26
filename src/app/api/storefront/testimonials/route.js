import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Testimonial from "@/lib/models/Testimonial";
import { mapTestimonialToStorefront } from "@/lib/storefront/adapter";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const sp = new URL(request.url).searchParams;
    const limit = Math.min(50, Math.max(1, parseInt(sp.get("limit") || "12", 10) || 12));
    const docs = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({ items: docs.map(mapTestimonialToStorefront) });
  } catch (err) {
    console.error("[storefront testimonials]", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
