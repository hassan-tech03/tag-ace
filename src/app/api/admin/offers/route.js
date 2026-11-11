import { NextResponse } from "next/server";
import { eq, gt, lt } from "drizzle-orm";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, offers } from "@/lib/db";
import {
  buildOrderBy,
  countAll,
  pageResult,
  searchAny,
  serialize,
  where,
} from "@/lib/db/helpers";
import { activeOfferFilter } from "@/lib/db/queries";
import { offerCreateSchema } from "@/lib/validation";

const SORT_COLUMNS = {
  order: offers.order,
  createdAt: offers.createdAt,
  title: offers.title,
  startsAt: offers.startsAt,
  endsAt: offers.endsAt,
};

function statusFilter(status, now) {
  switch (status) {
    case "active":
      return activeOfferFilter(now);
    case "scheduled":
      return where(eq(offers.isActive, true), gt(offers.startsAt, now));
    case "expired":
      return lt(offers.endsAt, now);
    case "disabled":
      return eq(offers.isActive, false);
    default:
      return undefined;
  }
}

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, defaultSort, sp } = parseListParams(request.url, {
    defaultSort: "order -createdAt",
  });
  const type = sp.get("type")?.trim();
  const status = sp.get("status")?.trim();

  const filter = where(
    searchAny(search, [offers.title, offers.subtitle, offers.description]),
    type ? eq(offers.type, type) : undefined,
    statusFilter(status, new Date())
  );

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(offers)
      .where(filter)
      .orderBy(...buildOrderBy(sort, SORT_COLUMNS, defaultSort))
      .limit(limit)
      .offset(skip),
    db.select({ count: countAll }).from(offers).where(filter),
  ]);

  return NextResponse.json(pageResult(rows.map(serialize), count, page, limit));
});

export const POST = adminRoute(async (request) => {
  const data = offerCreateSchema.parse(await request.json());
  const [row] = await db.insert(offers).values(data).returning();
  return NextResponse.json(serialize(row), { status: 201 });
});
