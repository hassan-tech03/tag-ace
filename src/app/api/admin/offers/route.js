import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import Offer from "@/lib/models/Offer";
import { offerCreateSchema } from "@/lib/validation";

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, sp } = parseListParams(request.url, {
    defaultSort: "order -createdAt",
  });
  const type = sp.get("type")?.trim();
  const status = sp.get("status")?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { subtitle: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (type) filter.type = type;

  const now = new Date();
  if (status === "active") {
    filter.isActive = true;
    filter.$and = [
      ...(filter.$and || []),
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ];
  } else if (status === "scheduled") {
    filter.isActive = true;
    filter.startsAt = { $gt: now };
  } else if (status === "expired") {
    filter.endsAt = { $lt: now };
  } else if (status === "disabled") {
    filter.isActive = false;
  }

  const [items, total] = await Promise.all([
    Offer.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Offer.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

export const POST = adminRoute(async (request) => {
  const body = await request.json();
  const data = offerCreateSchema.parse(body);
  const doc = await Offer.create(data);
  return NextResponse.json(doc, { status: 201 });
});
