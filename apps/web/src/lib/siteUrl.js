// Public base URL of the site, used for absolute links such as Stripe
// success/cancel URLs.
//
// Order: SITE_URL / NEXT_PUBLIC_DOMAIN env (if set), otherwise the host the
// request came in on (proxy headers first). That lets one build run under any
// domain without rebuilding.
export function siteUrl(request) {
  const fromEnv = process.env.SITE_URL || process.env.NEXT_PUBLIC_DOMAIN;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const headers = request?.headers;
  const host = headers?.get("x-forwarded-host")?.split(",")[0].trim() || headers?.get("host");
  if (!host) return "http://localhost:3000";

  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const proto = forwardedProto || (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}
