import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Testimonial from "@/lib/models/Testimonial";
import { testimonialUpdateSchema } from "@/lib/validation";

export const GET = adminRoute(async (_req, { params }) => {
  let doc = null;
  try {
    doc = await Testimonial.findById(params.id).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const PATCH = adminRoute(async (request, { params }) => {
  const body = await request.json();
  const data = testimonialUpdateSchema.parse(body);
  let doc = null;
  try {
    doc = await Testimonial.findByIdAndUpdate(params.id, data, {
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
    doc = await Testimonial.findByIdAndDelete(params.id).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
});
