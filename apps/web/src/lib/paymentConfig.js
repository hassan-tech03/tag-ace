// Card payments are offered only with live Stripe keys. In test mode
// (pk_test_) real cards can't be charged, so the store shows Cash on
// Delivery only. Set NEXT_PUBLIC_CARD_PAYMENTS=on to force cards on (e.g.
// for testing the Stripe flow). NEXT_PUBLIC_* values are fixed at build time.
const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const CARD_PAYMENTS_ENABLED =
  key.startsWith("pk_live_") || process.env.NEXT_PUBLIC_CARD_PAYMENTS === "on";
