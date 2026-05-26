// Tunable storefront-wide order math. Kept in one place so the public order
// API, the Stripe payment intent route, and the admin can all agree.
export const SHIPPING_FREE_THRESHOLD = 50;
export const SHIPPING_RATE = 9.99;
export const TAX_RATE = 0.08; // 8%

// Pulls a numeric price out of mixed-type values like 45, "$45.00", or "From $79".
export function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const m = value.match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }
  return 0;
}

export function normalizeItems(items = []) {
  return items
    .map((it) => ({
      productId: String(it.productId ?? it.id ?? ""),
      name: String(it.name || ""),
      price: Number(toNumber(it.price).toFixed(2)),
      quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
      image: typeof it.image === "string" ? it.image : "",
      sku: typeof it.sku === "string" ? it.sku : "",
    }))
    .filter((it) => it.name && it.price >= 0 && it.quantity > 0);
}

export function computeTotals(items) {
  const normalized = normalizeItems(items);
  const subtotal = normalized.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  return {
    items: normalized,
    subtotal: round(subtotal),
    shipping: round(shipping),
    tax: round(tax),
    total: round(total),
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

// Order number like "MSK-LMNOPQ-AB12" - timestamp base36 + 4 random alphanumerics.
// Sortable-ish by creation since the prefix comes from Date.now(), and short.
export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, "X");
  return `MSK-${ts}-${rand}`;
}
