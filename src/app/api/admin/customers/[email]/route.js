import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Order from "@/lib/models/Order";

// Returns:
//  - customer: rolled-up stats and most recent profile fields
//  - orders:   full order history (newest first) for the order-history table
//  - addresses: deduped shipping addresses the customer has used
export const GET = adminRoute(async (_req, { params }) => {
  const email = decodeURIComponent(params.email || "").toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const orders = await Order.find({ "customer.email": email })
    .sort({ createdAt: -1 })
    .lean();

  if (orders.length === 0) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const newest = orders[0];
  const oldest = orders[orders.length - 1];
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const paidSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + (o.total || 0), 0);

  // Dedupe shipping addresses by a normalized fingerprint.
  const addressMap = new Map();
  for (const o of orders) {
    const a = o.shippingAddress || {};
    const key = [a.line1, a.line2, a.city, a.state, a.zipCode, a.country]
      .map((s) => (s || "").trim().toLowerCase())
      .join("|");
    if (key.replace(/\|/g, "") && !addressMap.has(key)) addressMap.set(key, a);
  }

  return NextResponse.json({
    customer: {
      email,
      firstName: newest.customer?.firstName || "",
      lastName: newest.customer?.lastName || "",
      phone: newest.customer?.phone || "",
      orderCount: orders.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      paidSpent: Math.round(paidSpent * 100) / 100,
      firstOrderAt: oldest.createdAt,
      lastOrderAt: newest.createdAt,
    },
    addresses: Array.from(addressMap.values()),
    orders: orders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      itemCount: (o.items || []).reduce((s, it) => s + (it.quantity || 0), 0),
    })),
  });
});
