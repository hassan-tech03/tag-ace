import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Order from "@/lib/models/Order";
import { orderAdminUpdateSchema } from "@/lib/validation";

export const GET = adminRoute(async (_req, { params }) => {
  let doc = null;
  try {
    doc = await Order.findById(params.id).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});

export const PATCH = adminRoute(async (request, { params }) => {
  const body = await request.json();
  const data = orderAdminUpdateSchema.parse(body);

  // Track cancellation timestamp automatically.
  if (data.status === "cancelled") data.cancelledAt = new Date();

  let doc = null;
  try {
    doc = await Order.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    }).lean();
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
});
