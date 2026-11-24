// Store currency: Pakistani Rupee. Prices are whole rupees in practice, so
// they're shown without decimals ("Rs 9,500"). en-US grouping keeps server
// and browser output identical (no hydration mismatch).
export const CURRENCY = "PKR";
export const STRIPE_CURRENCY = "pkr";

export function formatPrice(value) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Rs ${Math.round(safe).toLocaleString("en-US")}`;
}
