import { and, eq, or } from "drizzle-orm";
import { db, products } from "@mushk/db";
import { isUuid } from "@mushk/db/helpers";
import { getSettings } from "@mushk/db/queries";
import { ratesFromSettings } from "@/lib/orderUtils";
import { absoluteUrl, breadcrumbJsonLd, JsonLd, pageMetadata, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

// The product page itself is a client component; this server layout adds the
// per-product <title>, description, canonical URL, share image and
// structured data (Product + BreadcrumbList) for search engines.

async function getProduct(idOrSlug) {
  const key = decodeURIComponent(String(idOrSlug || ""));
  if (!key || key.length > 200) return null;
  try {
    const match = isUuid(key) ? or(eq(products.id, key), eq(products.slug, key)) : eq(products.slug, key);
    const [row] = await db.select().from(products).where(and(match, eq(products.status, "active")));
    return row || null;
  } catch {
    return null;
  }
}

function describe(p) {
  const base = (p.shortDescription || p.description || "").replace(/\s+/g, " ").trim();
  const extra = [p.fragranceFamily, p.size].filter(Boolean).join(" · ");
  const who = p.category === "men" ? "for men" : p.category === "women" ? "for women" : "";
  const text = base || `${p.name}, a ${p.fragranceFamily ? p.fragranceFamily.toLowerCase() + " " : ""}perfume ${who} by ${SITE_NAME}.`;
  const suffix = ` Rs ${Math.round(Number(p.price)).toLocaleString("en-US")} · Cash on Delivery across Pakistan.`;
  const out = `${text}${extra && !base ? ` ${extra}.` : ""}${suffix}`;
  return out.length > 300 ? `${out.slice(0, 297)}…` : out;
}

export async function generateMetadata({ params }) {
  const p = await getProduct(params.id);
  if (!p) return { title: "Product not found", robots: { index: false, follow: true } };
  const path = `/products/${p.slug}`;
  return pageMetadata({
    title: `${p.name}${p.category ? ` · ${p.category === "men" ? "Men's" : "Women's"} Perfume` : ""}`,
    description: describe(p),
    path,
    image: p.images?.[0] || undefined,
  });
}

export default async function ProductLayout({ children, params }) {
  const p = await getProduct(params.id);
  if (!p) return children;

  const url = absoluteUrl(`/products/${p.slug}`);
  let rates = null;
  try {
    rates = ratesFromSettings((await getSettings()).shipping);
  } catch {
    /* settings unavailable: omit shipping details */
  }

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: (p.description || p.shortDescription || describe(p)).slice(0, 5000),
    image: (p.images || []).filter(Boolean).slice(0, 6),
    url,
    sku: p.sku || p.slug,
    brand: { "@type": "Brand", name: p.brand || SITE_NAME },
    category: p.category === "men" ? "Men's Fragrances" : p.category === "women" ? "Women's Fragrances" : "Fragrances",
    ...(p.size ? { size: p.size } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: Number(p.price).toFixed(0),
      availability: Number(p.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
      ...(rates
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
              shippingRate: {
                "@type": "MonetaryAmount",
                currency: "PKR",
                value:
                  rates.freeShippingThreshold > 0 && Number(p.price) >= rates.freeShippingThreshold
                    ? 0
                    : rates.flatRate,
              },
            },
          }
        : {}),
    },
  };

  const crumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(p.category === "men" || p.category === "women"
      ? [{ name: p.category === "men" ? "Men" : "Women", path: `/shop/${p.category}` }]
      : []),
    { name: p.name, path: `/products/${p.slug}` },
  ]);

  return (
    <>
      <JsonLd data={product} />
      <JsonLd data={crumbs} />
      {children}
    </>
  );
}
