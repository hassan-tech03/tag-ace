import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Coupon from "@/lib/models/Coupon";

// Returns a comprehensive dashboard payload in a single round trip.
// Query params:
//   range = "7d" | "30d" | "90d" | "365d" (default "30d")
// Money is summed against `total` (gross) and "paidRevenue" (only paid).
export const GET = adminRoute(async (request) => {
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30d";

  const days =
    { "7d": 7, "30d": 30, "90d": 90, "365d": 365 }[range] || 30;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const isPaid = {
    $in: [
      "$paymentStatus",
      ["paid", "cod_collected"],
    ],
  };

  const [
    totalsAgg,
    rangeAgg,
    seriesAgg,
    topProductsAgg,
    topCategoriesAgg,
    statusAgg,
    paymentAgg,
    recentOrders,
    productCount,
    activeCouponCount,
  ] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
          paidRevenue: { $sum: { $cond: [isPaid, "$total", 0] } },
          paidOrders: { $sum: { $cond: [isPaid, 1, 0] } },
          emails: { $addToSet: "$customer.email" },
        },
      },
    ]),

    Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
          paidRevenue: { $sum: { $cond: [isPaid, "$total", 0] } },
          paidOrders: { $sum: { $cond: [isPaid, 1, 0] } },
          emails: { $addToSet: "$customer.email" },
        },
      },
    ]),

    Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
          paidRevenue: { $sum: { $cond: [isPaid, "$total", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $ifNull: ["$items.productId", "$items.name"] },
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          qty: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),

    // Top categories: look up each item's product (best effort - items are
    // denormalized snapshots, so we match by name when we can't match by id).
    Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          let: { name: "$items.name" },
          pipeline: [
            { $match: { $expr: { $eq: ["$name", "$$name"] } } },
            { $project: { category: 1 } },
            { $limit: 1 },
          ],
          as: "product",
        },
      },
      {
        $addFields: {
          category: {
            $ifNull: [{ $arrayElemAt: ["$product.category", 0] }, "uncategorized"],
          },
        },
      },
      {
        $group: {
          _id: "$category",
          qty: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orders: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          category: "$_id",
          _id: 0,
          qty: 1,
          revenue: 1,
          orders: { $size: "$orders" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),

    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),

    Order.find()
      .sort("-createdAt")
      .limit(5)
      .select(
        "orderNumber total paymentStatus status customer.email customer.firstName customer.lastName createdAt"
      )
      .lean(),

    Product.countDocuments({}),
    Coupon.countDocuments({ isActive: true }),
  ]);

  const totalsRaw = totalsAgg[0] || {};
  const rangeRaw = rangeAgg[0] || {};

  function pack(raw) {
    const orders = raw.orders || 0;
    const paidOrders = raw.paidOrders || 0;
    const paidRevenue = raw.paidRevenue || 0;
    return {
      orders,
      paidOrders,
      revenue: raw.revenue || 0,
      paidRevenue,
      customers: (raw.emails || []).length,
      aov: paidOrders ? paidRevenue / paidOrders : 0,
    };
  }

  // Fill missing days with zeros so the chart is continuous.
  const seriesMap = new Map(seriesAgg.map((d) => [d._id, d]));
  const series = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = seriesMap.get(key);
    series.push({
      date: key,
      orders: row?.orders || 0,
      revenue: row?.revenue || 0,
      paidRevenue: row?.paidRevenue || 0,
    });
  }

  const orderStatus = Object.fromEntries(
    (statusAgg || []).map((r) => [r._id, r.count])
  );
  const paymentStatus = Object.fromEntries(
    (paymentAgg || []).map((r) => [r._id, r.count])
  );

  return NextResponse.json({
    range,
    days,
    totals: pack(totalsRaw),
    rangeStats: pack(rangeRaw),
    series,
    topProducts: topProductsAgg,
    topCategories: topCategoriesAgg,
    orderStatus,
    paymentStatus,
    recentOrders,
    counts: {
      products: productCount,
      activeCoupons: activeCouponCount,
    },
  });
});
