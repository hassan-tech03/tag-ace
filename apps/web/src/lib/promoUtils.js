// Small helpers shared by the Coupons and Offers admin UIs.

// Format a Date / ISO string as a value suitable for <input type="datetime-local">
// (local time, no timezone suffix).
export function toLocalDatetime(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Parse the value of a datetime-local input back to a Date, or null if empty.
export function fromLocalDatetime(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Derive a coupon's effective status from isActive + validity window.
export function couponStatus(c, now = new Date()) {
  if (!c.isActive) return "disabled";
  if (c.validFrom && new Date(c.validFrom) > now) return "scheduled";
  if (c.validUntil && new Date(c.validUntil) < now) return "expired";
  if (c.usageLimit != null && (c.usedCount || 0) >= c.usageLimit) return "used_up";
  return "active";
}

export function offerStatus(o, now = new Date()) {
  if (!o.isActive) return "disabled";
  if (o.startsAt && new Date(o.startsAt) > now) return "scheduled";
  if (o.endsAt && new Date(o.endsAt) < now) return "expired";
  return "active";
}

// Quick random code like "MUSHK-7C2F" - good enough for low volume.
export function generateCouponCode(prefix = "MUSHK") {
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, "X");
  return `${prefix}-${rand}`;
}
