// Tunable storefront-wide order math. Kept in one place so the public order
// API, the Stripe payment intent route, and the admin can all agree.
// Amounts are in Pakistani Rupees (PKR). These are the defaults; the live
// values come from Admin -> Site Content -> Shipping (settings.shipping) via
// ratesFromSettings().
export const SHIPPING_FREE_THRESHOLD = 5000;
export const SHIPPING_RATE = 250;
export const TAX_RATE = 0; // prices are final; no separate tax line

export const DEFAULT_RATES = {
  freeShippingThreshold: SHIPPING_FREE_THRESHOLD,
  flatRate: SHIPPING_RATE,
  taxRate: TAX_RATE,
};

// Normalises settings.shipping (strings from the admin form, missing keys)
// into numbers. freeShippingThreshold 0 = never free.
export function ratesFromSettings(shipping) {
  const num = (v, d) => {
    const n = Number(v);
    return v === "" || v == null || !Number.isFinite(n) || n < 0 ? d : n;
  };
  return {
    freeShippingThreshold: num(shipping?.freeShippingThreshold, DEFAULT_RATES.freeShippingThreshold),
    flatRate: num(shipping?.flatRate, DEFAULT_RATES.flatRate),
    taxRate: Math.min(1, num(shipping?.taxRate, DEFAULT_RATES.taxRate)),
  };
}

export function shippingFor(subtotal, rates = DEFAULT_RATES) {
  if (subtotal <= 0) return 0;
  if (rates.freeShippingThreshold > 0 && subtotal >= rates.freeShippingThreshold) return 0;
  return rates.flatRate;
}

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

export function computeTotals(items, rates = DEFAULT_RATES) {
  const normalized = normalizeItems(items);
  const subtotal = normalized.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipping = shippingFor(subtotal, rates);
  const tax = subtotal * rates.taxRate;
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
