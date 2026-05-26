import { NextResponse } from "next/server";
import { adminRoute, parseListParams } from "@/lib/api";
import Order from "@/lib/models/Order";

// Customers are derived from the orders collection: group by email and roll
// up the last-known name/phone, lifetime stats, and first/last order dates.
// Whenever someone places an order, they automatically appear here.
export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, sp } = parseListParams(request.url, {
    defaultSort: "-lastOrderAt",
  });
  const minSpend = parseFloat(sp.get("minSpend") || "");

  // Pre-filter: any order whose customer fields match the search.
  const preMatch = {};
  if (search) {
    preMatch.$or = [
      { "customer.email": { $regex: search, $options: "i" } },
      { "customer.firstName": { $regex: search, $options: "i" } },
      { "customer.lastName": { $regex: search, $options: "i" } },
      { "customer.phone": { $regex: search, $options: "i" } },
    ];
  }

  // Post-group filter for things only meaningful after aggregation.
  const postMatch = {};
  if (Number.isFinite(minSpend) && minSpend > 0) {
    postMatch.totalSpent = { $gte: minSpend };
  }

  // Parse sort to Mongo shape: "-lastOrderAt" -> { lastOrderAt: -1 }
  const sortObj = {};
  for (const part of String(sort || "-lastOrderAt").split(/\s+/).filter(Boolean)) {
    const dir = part.startsWith("-") ? -1 : 1;
    const field = part.replace(/^-/, "");
    sortObj[field] = dir;
  }

  const pipeline = [
    ...(Object.keys(preMatch).length ? [{ $match: preMatch }] : []),
    // Ascending order so $last picks the most recent value for each field.
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$customer.email",
        email: { $first: "$customer.email" },
        firstName: { $last: "$customer.firstName" },
        lastName: { $last: "$customer.lastName" },
        phone: { $last: "$customer.phone" },
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$total" },
        paidSpent: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
          },
        },
        firstOrderAt: { $min: "$createdAt" },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
    ...(Object.keys(postMatch).length ? [{ $match: postMatch }] : []),
    {
      $facet: {
        items: [{ $sort: sortObj }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
        rollup: [
          {
            $group: {
              _id: null,
              customers: { $sum: 1 },
              orders: { $sum: "$orderCount" },
              spend: { $sum: "$totalSpent" },
              paidSpend: { $sum: "$paidSpent" },
            },
          },
        ],
      },
    },
  ];

  const [result] = await Order.aggregate(pipeline);
  const items = result?.items || [];
  const total = result?.totalCount?.[0]?.count || 0;
  const rollup = result?.rollup?.[0] || {
    customers: 0,
    orders: 0,
    spend: 0,
    paidSpend: 0,
  };

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    stats: rollup,
  });
});
