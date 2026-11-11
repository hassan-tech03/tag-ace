import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, orders } from "@/lib/db";
import { pageResult } from "@/lib/db/helpers";
import { orderSearchFilter } from "@/lib/db/queries";

// Whitelisted sort keys -> column names in the grouped CTE below.
const SORT_COLUMNS = {
  lastOrderAt: '"lastOrderAt"',
  firstOrderAt: '"firstOrderAt"',
  totalSpent: '"totalSpent"',
  paidSpent: '"paidSpent"',
  orderCount: '"orderCount"',
  email: "email",
  firstName: '"firstName"',
  lastName: '"lastName"',
};

function orderByClause(sort) {
  const parts = [];
  for (const part of String(sort || "").split(/\s+/).filter(Boolean)) {
    const col = SORT_COLUMNS[part.replace(/^-/, "")];
    if (col) parts.push(`${col} ${part.startsWith("-") ? "desc" : "asc"}`);
  }
  if (parts.length === 0) parts.push('"lastOrderAt" desc');
  parts.push("email asc"); // stable tie-breaker for pagination
  return sql.raw(parts.join(", "));
}

// Customers are derived from orders: group by email and roll up the
// last-known name/phone, lifetime stats, and first/last order dates.
// Whenever someone places an order, they automatically appear here.
export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, sp } = parseListParams(request.url, {
    defaultSort: "-lastOrderAt",
  });
  const minSpend = parseFloat(sp.get("minSpend") || "");

  const searchCond = orderSearchFilter(search);
  const preMatch = searchCond ? sql`where ${searchCond}` : sql``;
  const postMatch =
    Number.isFinite(minSpend) && minSpend > 0 ? sql`where "totalSpent" >= ${minSpend}` : sql``;

  const latest = (field) =>
    sql`(array_agg(${orders.customer}->>${field} order by ${orders.createdAt} desc))[1]`;

  const grouped = sql`
    with grouped as (
      select
        ${orders.customerEmail} as email,
        coalesce(${latest("firstName")}, '') as "firstName",
        coalesce(${latest("lastName")}, '') as "lastName",
        coalesce(${latest("phone")}, '') as "phone",
        count(*)::int as "orderCount",
        coalesce(sum(${orders.total}), 0) as "totalSpent",
        coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid'), 0) as "paidSpent",
        min(${orders.createdAt}) as "firstOrderAt",
        max(${orders.createdAt}) as "lastOrderAt"
      from ${orders}
      ${preMatch}
      group by ${orders.customerEmail}
    ),
    filtered as (select * from grouped ${postMatch})
  `;

  const [itemsRes, rollupRes] = await Promise.all([
    db.execute(sql`${grouped}
      select email, "firstName", "lastName", phone, "orderCount",
        "totalSpent"::float8 as "totalSpent", "paidSpent"::float8 as "paidSpent",
        "firstOrderAt", "lastOrderAt"
      from filtered
      order by ${orderByClause(sort)}
      limit ${limit} offset ${skip}`),
    db.execute(sql`${grouped}
      select
        count(*)::int as customers,
        coalesce(sum("orderCount"), 0)::int as orders,
        coalesce(sum("totalSpent"), 0)::float8 as spend,
        coalesce(sum("paidSpent"), 0)::float8 as "paidSpend"
      from filtered`),
  ]);

  // Raw queries return timestamps as Postgres text; normalise to ISO.
  const items = itemsRes.rows.map((r) => ({
    _id: r.email,
    ...r,
    firstOrderAt: new Date(r.firstOrderAt).toISOString(),
    lastOrderAt: new Date(r.lastOrderAt).toISOString(),
  }));
  const rollup = rollupRes.rows[0];

  return NextResponse.json({
    ...pageResult(items, rollup.customers, page, limit),
    stats: rollup,
  });
});
