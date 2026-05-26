import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import Order from "@/lib/models/Order";

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, sp } = parseListParams(request.url);
  const status = sp.get("status")?.trim();
  const paymentStatus = sp.get("paymentStatus")?.trim();
  const paymentMethod = sp.get("paymentMethod")?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
      { "customer.firstName": { $regex: search, $options: "i" } },
      { "customer.lastName": { $regex: search, $options: "i" } },
      { "customer.phone": { $regex: search, $options: "i" } },
    ];
  }
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  const [items, total, stats] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
            },
          },
        },
      },
    ]),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    revenue: stats?.[0]?.revenue || 0,
    paidRevenue: stats?.[0]?.paidRevenue || 0,
  });
});
