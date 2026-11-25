import { and, desc, eq, isNotNull, lte } from "drizzle-orm";
import { db, posts, products } from "@mushk/db";
import { absoluteUrl } from "@/lib/seo";

// /sitemap.xml — built from the database on each request, so new products
// and blog posts show up for search engines without a redeploy.
export const dynamic = "force-dynamic";

const STATIC_PAGES = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/shop/men", changeFrequency: "daily", priority: 0.9 },
  { path: "/shop/women", changeFrequency: "daily", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/shipping-returns", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap() {
  const now = new Date();
  const entries = STATIC_PAGES.map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  try {
    const [productRows, postRows] = await Promise.all([
      db
        .select({ slug: products.slug, updatedAt: products.updatedAt })
        .from(products)
        .where(eq(products.status, "active"))
        .orderBy(desc(products.updatedAt)),
      db
        .select({ slug: posts.slug, updatedAt: posts.updatedAt })
        .from(posts)
        .where(and(eq(posts.status, "published"), isNotNull(posts.publishedAt), lte(posts.publishedAt, now)))
        .orderBy(desc(posts.publishedAt)),
    ]);
    for (const p of productRows) {
      entries.push({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const p of postRows) {
      entries.push({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 });
    }
  } catch (err) {
    console.error("[sitemap]", err.message);
  }
  return entries;
}
