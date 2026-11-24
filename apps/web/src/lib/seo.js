// Shared SEO constants and helpers (metadata + JSON-LD structured data).

export const SITE_NAME = "Mushk Perfumes";
export const SITE_DESCRIPTION =
  "Premium perfumes for men and women in Pakistan. Long-lasting oud, floral, woody and fresh fragrances with Cash on Delivery and free delivery over Rs 5,000.";
export const DEFAULT_OG_IMAGE = "/og-image.jpg";

export function siteOrigin() {
  // Production domain as the fallback so pages pre-rendered at build time
  // never end up with localhost canonical/OG URLs.
  const env = process.env.SITE_URL || process.env.NEXT_PUBLIC_DOMAIN || "";
  const origin = /localhost|127\.0\.0\.1/.test(env) || !env ? "https://mushkscents.com" : env;
  return origin.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteOrigin()}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Page metadata with matching Open Graph / Twitter tags and a canonical URL.
export function pageMetadata({ title, description = SITE_DESCRIPTION, path = "/", image, noindex = false, type = "website" }) {
  const images = [{ url: image || DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title || SITE_NAME }];
  return {
    // Absolute title so nested layouts can't drop the brand suffix.
    ...(title ? { title: { absolute: `${title} · ${SITE_NAME}` } } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: SITE_NAME,
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description,
      locale: "en_PK",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description,
      images: images.map((i) => i.url),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

// <script type="application/ld+json"> for structured data. `<` is escaped so
// product/blog text can't break out of the script tag.
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd({ email, phone } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteOrigin(),
    logo: absoluteUrl("/brand/mushk-logo.png"),
    ...(email || phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            areaServed: "PK",
            availableLanguage: ["en", "ur"],
            ...(email ? { email } : {}),
            ...(phone ? { telephone: phone } : {}),
          },
        }
      : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteOrigin(),
    inLanguage: "en-PK",
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
