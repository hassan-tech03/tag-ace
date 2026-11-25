// Responsive image URLs. Cloudinary images are resized/compressed on the fly
// (f_auto = WebP/AVIF where supported, q_auto = smart quality), so a 280px
// card no longer downloads the 1024x1536 original.
export function imageUrl(url, width) {
  if (!url || typeof url !== "string") return url;
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  if (!m) return url;
  const [, base, rest] = m;
  // Leave URLs that already carry a transformation alone.
  if (/^(?:[a-z]{1,3}_[^/]+,?)+\//.test(rest)) return url;
  return `${base}f_auto,q_auto,c_limit,w_${Math.round(width)}/${rest}`;
}
