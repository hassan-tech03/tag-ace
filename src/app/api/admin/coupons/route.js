import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import Coupon from "@/lib/models/Coupon";
import { couponCreateSchema } from "@/lib/validation";

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, sp } = parseListParams(request.url);
  const status = sp.get("status")?.trim();
  const type = sp.get("type")?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (type) filter.type = type;

  // Status: derived from isActive + dates.
  const now = new Date();
  if (status === "active") {
    filter.isActive = true;
    filter.$and = [
      ...(filter.$and || []),
      { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
      { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
    ];
  } else if (status === "scheduled") {
    filter.isActive = true;
    filter.validFrom = { $gt: now };
  } else if (status === "expired") {
    filter.validUntil = { $lt: now };
  } else if (status === "disabled") {
    filter.isActive = false;
  }

  const [items, total] = await Promise.all([
    Coupon.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
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
  const data = couponCreateSchema.parse(body);
  data.code = data.code.toUpperCase().trim();
  const doc = await Coupon.create(data);
  return NextResponse.json(doc, { status: 201 });
});
