import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, testimonials } from "@/lib/db";
import { buildOrderBy, countAll, pageResult, searchAny, serialize, where } from "@/lib/db/helpers";
import { testimonialCreateSchema } from "@/lib/validation";

const SORT_COLUMNS = {
  order: testimonials.order,
  createdAt: testimonials.createdAt,
  name: testimonials.name,
  rating: testimonials.rating,
};

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, defaultSort, sp } = parseListParams(request.url, {
    defaultSort: "order -createdAt",
  });
  const status = sp.get("status")?.trim();

  const filter = where(
    searchAny(search, [testimonials.name, testimonials.location, testimonials.body]),
    status === "active" ? eq(testimonials.isActive, true) : undefined,
    status === "disabled" ? eq(testimonials.isActive, false) : undefined
  );

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(testimonials)
      .where(filter)
      .orderBy(...buildOrderBy(sort, SORT_COLUMNS, defaultSort))
      .limit(limit)
      .offset(skip),
    db.select({ count: countAll }).from(testimonials).where(filter),
  ]);

  return NextResponse.json(pageResult(rows.map(serialize), count, page, limit));
});

export const POST = adminRoute(async (request) => {
  const data = testimonialCreateSchema.parse(await request.json());
  const [row] = await db.insert(testimonials).values(data).returning();
  return NextResponse.json(serialize(row), { status: 201 });
});
