import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import Testimonial from "@/lib/models/Testimonial";
import { testimonialCreateSchema } from "@/lib/validation";

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, sp } = parseListParams(request.url, {
    defaultSort: "order -createdAt",
  });
  const status = sp.get("status")?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { body: { $regex: search, $options: "i" } },
    ];
  }
  if (status === "active") filter.isActive = true;
  if (status === "disabled") filter.isActive = false;

  const [items, total] = await Promise.all([
    Testimonial.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Testimonial.countDocuments(filter),
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
  const data = testimonialCreateSchema.parse(body);
  const doc = await Testimonial.create(data);
  return NextResponse.json(doc, { status: 201 });
});
