import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Coupon from "@/lib/models/Coupon";
import { couponUpdateSchema } from "@/lib/validation";

export const GET = adminRoute(async (_req, { params }) => {
  let doc = null;
  try {
    doc = await Coupon.findById(params.id).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const PATCH = adminRoute(async (request, { params }) => {
  const body = await request.json();
  const data = couponUpdateSchema.parse(body);
  if (data.code) data.code = data.code.toUpperCase().trim();

  let doc = null;
  try {
    doc = await Coupon.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    }).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const DELETE = adminRoute(async (_req, { params }) => {
  let doc = null;
  try {
    doc = await Coupon.findByIdAndDelete(params.id).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
});
