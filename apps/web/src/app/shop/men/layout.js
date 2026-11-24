import { and, desc, eq } from "drizzle-orm";
import { db, products } from "@mushk/db";
import { absoluteUrl, breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({ title: "Men's Perfumes", path: "/shop/men", description: "Long-lasting perfumes for men in Pakistan: oud, woody, spicy, fresh and aquatic fragrances by Mushk Perfumes. Cash on Delivery available nationwide." });

// Structured data: the collection's products as an ItemList + breadcrumbs.
export default async function Layout({ children }) {
  let items = [];
  try {
    items = await db
      .select({ slug: products.slug, name: products.name })
      .from(products)
      .where(and(eq(products.status, "active"), eq(products.category, "men")))
      .orderBy(desc(products.createdAt))
      .limit(60);
  } catch {
    /* database unavailable: render without the list */
  }
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Men's Perfumes",
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
  return (
    <>
      {items.length > 0 && <JsonLd data={list} />}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: "Men", path: "/shop/men" },
        ])}
      />
      {children}
    </>
  );
}
