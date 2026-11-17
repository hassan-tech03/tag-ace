import slugify from "slugify";

export function toSlug(value) {
  if (!value) return "";
  return slugify(String(value), { lower: true, strict: true, trim: true });
}
