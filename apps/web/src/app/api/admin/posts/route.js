import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminRoute, parseListParams } from "@/lib/api";
import { db, posts } from "@mushk/db";
import { buildOrderBy, countAll, pageResult, searchAny, serialize, where } from "@mushk/db/helpers";
import { postCreateSchema } from "@/lib/validation";
import { preparePost } from "@/lib/blog";

const SORT_COLUMNS = {
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
  publishedAt: posts.publishedAt,
  title: posts.title,
};

// List without the (potentially long) Markdown body.
const LIST_COLUMNS = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  author: posts.author,
  tags: posts.tags,
  status: posts.status,
  publishedAt: posts.publishedAt,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
};

export const GET = adminRoute(async (request) => {
  const { page, limit, skip, search, sort, defaultSort, sp } = parseListParams(request.url);
  const status = sp.get("status")?.trim();

  const filter = where(
    searchAny(search, [posts.title, posts.excerpt, posts.slug]),
    status === "draft" || status === "published" ? eq(posts.status, status) : undefined
  );

  const [rows, [{ count }]] = await Promise.all([
    db
      .select(LIST_COLUMNS)
      .from(posts)
      .where(filter)
      .orderBy(...buildOrderBy(sort, SORT_COLUMNS, defaultSort))
      .limit(limit)
      .offset(skip),
    db.select({ count: countAll }).from(posts).where(filter),
  ]);

  return NextResponse.json(pageResult(rows.map(serialize), count, page, limit));
});

export const POST = adminRoute(async (request) => {
  const data = preparePost(postCreateSchema.parse(await request.json()));
  const [row] = await db.insert(posts).values(data).returning();
  return NextResponse.json(serialize(row), { status: 201 });
});
