import { NextResponse } from "next/server";
import { eq, gt, gte, isNull, lt, lte, or } from "drizzle-orm";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, coupons } from "@/lib/db";
import { buildOrderBy, countAll, pageResult, searchAny, serialize, where } from "@/lib/db/helpers";
import { couponCreateSchema } from "@/lib/validation";

const SORT_COLUMNS = {
  createdAt: coupons.createdAt,
  code: coupons.code,
  value: coupons.value,
  usedCount: coupons.usedCount,
  validFrom: coupons.validFrom,
  validUntil: coupons.validUntil,
};

// Status is derived from isActive + the validity window.
function statusFilter(status, now) {
  switch (status) {
    case "active":
      return where(
        eq(coupons.isActive, true),
        or(isNull(coupons.validFrom), lte(coupons.validFrom, now)),
        or(isNull(coupons.validUntil), gte(coupons.validUntil, now))
      );
    case "scheduled":
      return where(eq(coupons.isActive, true), gt(coupons.validFrom, now));
    case "expired":
      return lt(coupons.validUntil, now);
    case "disabled":
      return eq(coupons.isActive, false);
    default:
      return undefined;
  }
}

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, defaultSort, sp } = parseListParams(request.url);
  const status = sp.get("status")?.trim();
  const type = sp.get("type")?.trim();

  const filter = where(
    searchAny(search, [coupons.code, coupons.description]),
    type ? eq(coupons.type, type) : undefined,
    statusFilter(status, new Date())
  );

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(coupons)
      .where(filter)
      .orderBy(...buildOrderBy(sort, SORT_COLUMNS, defaultSort))
      .limit(limit)
      .offset(skip),
    db.select({ count: countAll }).from(coupons).where(filter),
  ]);

  return NextResponse.json(pageResult(rows.map(serialize), count, page, limit));
});

export const POST = adminRoute(async (request) => {
  const data = couponCreateSchema.parse(await request.json());
  data.code = data.code.toUpperCase().trim();
  const [row] = await db.insert(coupons).values(data).returning();
  return NextResponse.json(serialize(row), { status: 201 });
});
