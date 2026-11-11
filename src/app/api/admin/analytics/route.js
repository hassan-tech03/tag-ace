import { NextResponse } from "next/server";
import { desc, eq, gte, sql } from "drizzle-orm";
import { adminRoute } from "@/lib/api";
import { db, orders, products, coupons } from "@/lib/db";

// Returns a comprehensive dashboard payload in a single round trip.
// Query params:
//   range = "7d" | "30d" | "90d" | "365d" (default "30d")
// Money is summed against `total` (gross) and "paidRevenue" (only paid).
export const GET = adminRoute(async (request) => {
  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30d";

  const days = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 }[range] || 30;
  // Day buckets are UTC (both here and in the SQL below) so the chart keys
  // line up regardless of the server's timezone.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const isPaid = sql`${orders.paymentStatus} in ('paid', 'cod_collected')`;
  const totalsSelect = {
    orders: sql`count(*)::int`,
    revenue: sql`coalesce(sum(${orders.total}), 0)::float8`,
    paidRevenue: sql`coalesce(sum(${orders.total}) filter (where ${isPaid}), 0)::float8`,
    paidOrders: sql`(count(*) filter (where ${isPaid}))::int`,
    customers: sql`count(distinct ${orders.customerEmail})::int`,
  };
  const inRange = gte(orders.createdAt, since);

  const [
    [totalsRaw],
    [rangeRaw],
    seriesRows,
    topProductsRes,
    topCategoriesRes,
    statusRows,
    paymentRows,
    recentRows,
    [{ productCount }],
    [{ activeCouponCount }],
  ] = await Promise.all([
    db.select(totalsSelect).from(orders),
    db.select(totalsSelect).from(orders).where(inRange),

    db
      .select({
        date: sql`to_char(${orders.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`.as("date"),
        orders: sql`count(*)::int`,
        revenue: sql`coalesce(sum(${orders.total}), 0)::float8`,
        paidRevenue: sql`coalesce(sum(${orders.total}) filter (where ${isPaid}), 0)::float8`,
      })
      .from(orders)
      .where(inRange)
      .groupBy(sql`1`)
      .orderBy(sql`1`),

    // Order items are jsonb snapshots; unnest them to rank products.
    db.execute(sql`
      select
        coalesce(nullif(item->>'productId', ''), item->>'name') as "_id",
        (array_agg(item->>'name'))[1] as name,
        (array_agg(item->>'image'))[1] as image,
        sum((item->>'quantity')::int)::int as qty,
        sum((item->>'price')::numeric * (item->>'quantity')::int)::float8 as revenue
      from ${orders}, jsonb_array_elements(${orders.items}) as item
      where ${orders.createdAt} >= ${since}
      group by 1
      order by revenue desc
      limit 8
    `),

    // Top categories: resolve each item to its product (by id when the
    // snapshot has one, otherwise by name) to read the current category.
    db.execute(sql`
      select
        coalesce(p.category, 'uncategorized') as category,
        sum((item->>'quantity')::int)::int as qty,
        sum((item->>'price')::numeric * (item->>'quantity')::int)::float8 as revenue,
        count(distinct o.id)::int as orders
      from ${orders} o
      cross join lateral jsonb_array_elements(o.items) as item
      left join lateral (
        select ${products.category} as category
        from ${products}
        where ${products.id}::text = item->>'productId' or ${products.name} = item->>'name'
        order by (${products.id}::text = item->>'productId') desc
        limit 1
      ) p on true
      where o.created_at >= ${since}
      group by 1
      order by revenue desc
      limit 6
    `),

    db
      .select({ key: orders.status, count: sql`count(*)::int` })
      .from(orders)
      .groupBy(orders.status),
    db
      .select({ key: orders.paymentStatus, count: sql`count(*)::int` })
      .from(orders)
      .groupBy(orders.paymentStatus),

    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        total: orders.total,
        paymentStatus: orders.paymentStatus,
        status: orders.status,
        customerEmail: orders.customerEmail,
        customer: orders.customer,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5),

    db.select({ productCount: sql`count(*)::int` }).from(products),
    db
      .select({ activeCouponCount: sql`count(*)::int` })
      .from(coupons)
      .where(eq(coupons.isActive, true)),
  ]);

  function pack(raw = {}) {
    const paidOrders = raw.paidOrders || 0;
    const paidRevenue = raw.paidRevenue || 0;
    return {
      orders: raw.orders || 0,
      paidOrders,
      revenue: raw.revenue || 0,
      paidRevenue,
      customers: raw.customers || 0,
      aov: paidOrders ? paidRevenue / paidOrders : 0,
    };
  }

  // Fill missing days with zeros so the chart is continuous.
  const seriesMap = new Map(seriesRows.map((d) => [d.date, d]));
  const series = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = seriesMap.get(key);
    series.push({
      date: key,
      orders: row?.orders || 0,
      revenue: row?.revenue || 0,
      paidRevenue: row?.paidRevenue || 0,
    });
  }

  const toMap = (rows) => Object.fromEntries(rows.map((r) => [r.key, r.count]));

  return NextResponse.json({
    range,
    days,
    totals: pack(totalsRaw),
    rangeStats: pack(rangeRaw),
    series,
    topProducts: topProductsRes.rows,
    topCategories: topCategoriesRes.rows,
    orderStatus: toMap(statusRows),
    paymentStatus: toMap(paymentRows),
    recentOrders: recentRows.map((o) => ({
      _id: o.id,
      orderNumber: o.orderNumber,
      total: o.total,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt,
      customer: {
        email: o.customerEmail,
        firstName: o.customer?.firstName || "",
        lastName: o.customer?.lastName || "",
      },
    })),
    counts: {
      products: productCount,
      activeCoupons: activeCouponCount,
    },
  });
});
