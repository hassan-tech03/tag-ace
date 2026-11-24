#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seeds the starter blog posts (seed-data/blog-posts.mjs) as published posts.
 *
 * Safe to re-run: posts are upserted by slug. Existing posts keep any edits
 * made in the admin unless FORCE=1 is set, which overwrites them.
 *
 *   npm run seed:blog
 */
import { sql } from "drizzle-orm";
import { connect } from "./_db.mjs";
import { BLOG_POSTS } from "../seed-data/blog-posts.mjs";

const { db, pool, schema } = connect();
const { posts } = schema;
const force = process.env.FORCE === "1";

async function main() {
  let created = 0;
  let skipped = 0;
  let updated = 0;
  for (const p of BLOG_POSTS) {
    const values = {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage || "",
      author: p.author || "Mushk Perfumes",
      tags: p.tags || [],
      status: "published",
      publishedAt: new Date(p.publishedAt),
    };
    const q = db.insert(posts).values(values);
    const [row] = force
      ? await q
          .onConflictDoUpdate({ target: posts.slug, set: { ...values, updatedAt: new Date() } })
          .returning({ inserted: sql`(xmax = 0)` })
      : await q.onConflictDoNothing({ target: posts.slug }).returning({ inserted: sql`(xmax = 0)` });

    if (!row) skipped += 1;
    else if (row.inserted) created += 1;
    else updated += 1;
  }
  console.log(`✔ Blog: ${created} created, ${updated} updated, ${skipped} already existed (total ${BLOG_POSTS.length}).`);
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
