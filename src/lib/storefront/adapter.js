// Maps DB documents to the shape the storefront UI components already expect.
// Keeping this single mapping isolated means the existing storefront files
// don't have to learn about Mongo or schema changes - we just keep this
// adapter honest.

export function mapProductToStorefront(p) {
  if (!p) return null;
  const id = p._id?.toString?.() || p.id || p.slug;
  const stock = Number(p.stock || 0);
  const out = stock <= 0;
  const images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];

  // The storefront's gender pages (men/women/unisex) sub-filter on a
  // "category" like cologne/eau-de-parfum which maps to the admin's
  // `fragranceFamily` field. The DB-level `category` field stores the
  // top-level gender slug. We surface both so each consumer picks the right
  // one without surprises.
  const gender = (p.category || "").toLowerCase();
  return {
    id, // Mongo id as string
    slug: p.slug || "",
    name: p.name,
    price: Number(p.price || 0),
    originalPrice: p.originalPrice == null ? null : Number(p.originalPrice),
    badge: p.badge || null,
    category: (p.fragranceFamily || "").toLowerCase(),
    gender,
    description: p.description || "",
    shortDescription: p.shortDescription || "",
    fragranceFamily: p.fragranceFamily || "",
    size: p.size || "",
    brand: p.brand || "",
    sku: p.sku || "",
    image: images[0] || "",
    hoverImage: images[1] || "",
    images,
    stock,
    availability: out ? "out-of-stock" : "in-stock",
    rating: Number(p.rating || 0),
    reviewCount: Number(p.reviewCount || 0),
    isHotDeal: !!p.isHotDeal,
    isNewArrival: !!p.isNewArrival,
    notes: p.notes || { top: [], middle: [], base: [] },
  };
}

export function mapCategoryToStorefront(c) {
  if (!c) return null;
  return {
    id: c._id?.toString?.() || c.slug,
    slug: c.slug,
    name: c.name,
    description: c.description || "",
    image: c.image || "",
    order: c.order || 0,
  };
}

export function mapOfferToStorefront(o) {
  if (!o) return null;
  return {
    id: o._id?.toString?.() || "",
    title: o.title,
    subtitle: o.subtitle || "",
    description: o.description || "",
    type: o.type,
    image: o.image || "",
    link: o.link || "",
    ctaText: o.ctaText || "",
    discountPercent: Number(o.discountPercent || 0),
    startsAt: o.startsAt || null,
    endsAt: o.endsAt || null,
    order: Number(o.order || 0),
  };
}

export function mapTestimonialToStorefront(t) {
  if (!t) return null;
  return {
    id: t._id?.toString?.() || "",
    name: t.name,
    location: t.location || "",
    rating: Number(t.rating || 5),
    body: t.body,
    image: t.image || "",
    order: Number(t.order || 0),
  };
}
