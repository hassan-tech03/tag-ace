import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, orders } from "@/lib/db";
import { buildOrderBy, pageResult, serializeOrder, where } from "@/lib/db/helpers";
import { orderSearchFilter } from "@/lib/db/queries";

const SORT_COLUMNS = {
  createdAt: orders.createdAt,
  updatedAt: orders.updatedAt,
  total: orders.total,
  orderNumber: orders.orderNumber,
  status: orders.status,
  paymentStatus: orders.paymentStatus,
};

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, defaultSort, sp } = parseListParams(request.url);
  const status = sp.get("status")?.trim();
  const paymentStatus = sp.get("paymentStatus")?.trim();
  const paymentMethod = sp.get("paymentMethod")?.trim();

  const filter = where(
    orderSearchFilter(search),
    status ? eq(orders.status, status) : undefined,
    paymentStatus ? eq(orders.paymentStatus, paymentStatus) : undefined,
    paymentMethod ? eq(orders.paymentMethod, paymentMethod) : undefined
  );

  const [rows, [stats]] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(filter)
      .orderBy(...buildOrderBy(sort, SORT_COLUMNS, defaultSort))
      .limit(limit)
      .offset(skip),
    db
      .select({
        count: sql`count(*)::int`,
        revenue: sql`coalesce(sum(${orders.total}), 0)::float8`,
        paidRevenue: sql`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid'), 0)::float8`,
      })
      .from(orders)
      .where(filter),
  ]);

  return NextResponse.json({
    ...pageResult(rows.map(serializeOrder), stats.count, page, limit),
    revenue: stats.revenue,
    paidRevenue: stats.paidRevenue,
  });
});
