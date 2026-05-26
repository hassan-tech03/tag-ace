import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Offer from "@/lib/models/Offer";
import { mapOfferToStorefront } from "@/lib/storefront/adapter";

export async function GET(request) {
  try {
    await dbConnect();
    const sp = new URL(request.url).searchParams;
    const type = sp.get("type")?.trim();
    const limit = Math.min(20, Math.max(1, parseInt(sp.get("limit") || "10", 10) || 10));

    const now = new Date();
    const filter = {
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    };
    if (type) filter.type = type;

    const docs = await Offer.find(filter).sort({ order: 1, createdAt: -1 }).limit(limit).lean();
    return NextResponse.json({ items: docs.map(mapOfferToStorefront) });
  } catch (err) {
    console.error("[storefront offers]", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
