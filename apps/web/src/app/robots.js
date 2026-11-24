import { absoluteUrl, siteOrigin } from "@/lib/seo";

// /robots.txt. Storefront APIs stay crawlable: the shop pages load products
// from /api/storefront in the browser, and Google needs them to render.
export const dynamic = "force-dynamic";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/storefront/"],
        disallow: [
          "/admin",
          "/api/admin",
          "/api/auth",
          "/api/orders",
          "/api/checkout",
          "/api/create-payment-intent",
          "/api/contact",
          "/api/webhooks",
          "/cart",
          "/checkout",
          "/order-confirmation",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteOrigin(),
  };
}
