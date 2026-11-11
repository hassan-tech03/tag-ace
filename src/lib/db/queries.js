import { eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { db, offers, orders, settings, SETTINGS_DEFAULTS } from "@/lib/db";
import { searchAny, where } from "@/lib/db/helpers";

const SETTINGS_SECTIONS = Object.keys(SETTINGS_DEFAULTS);

// Offers that are switched on and inside their (optional) date window.
export function activeOfferFilter(now = new Date()) {
  return where(
    eq(offers.isActive, true),
    or(isNull(offers.startsAt), lte(offers.startsAt, now)),
    or(isNull(offers.endsAt), gte(offers.endsAt, now))
  );
}

// Matches an order by number or by any customer field.
export function orderSearchFilter(search) {
  return searchAny(search, [
    orders.orderNumber,
    orders.customerEmail,
    sql`${orders.customer}->>'firstName'`,
    sql`${orders.customer}->>'lastName'`,
    sql`${orders.customer}->>'phone'`,
  ]);
}

// Fill in any keys missing from a stored section with defaults, so the UI
// always receives a complete object.
function withDefaults(row) {
  const out = { _id: row.id, id: row.id, createdAt: row.createdAt, updatedAt: row.updatedAt };
  for (const section of SETTINGS_SECTIONS) {
    out[section] = { ...SETTINGS_DEFAULTS[section], ...(row[section] || {}) };
  }
  return out;
}

// The single settings row (id = "site"), created on first read.
export async function getSettings() {
  let [row] = await db.select().from(settings).where(eq(settings.id, "site"));
  if (!row) {
    [row] = await db
      .insert(settings)
      .values({ id: "site" })
      .onConflictDoUpdate({ target: settings.id, set: { id: "site" } })
      .returning();
  }
  return withDefaults(row);
}

// Partial deep-merge: callers send only the sections/keys they changed.
// Each section is merged with jsonb `||`, so untouched keys are kept.
export async function updateSettings(data) {
  await getSettings(); // make sure the row exists

  const set = {};
  for (const section of SETTINGS_SECTIONS) {
    const value = data[section];
    if (value && typeof value === "object") {
      const clean = Object.fromEntries(
        Object.entries(value).filter(([, v]) => v !== undefined)
      );
      set[section] = sql`${settings[section]} || ${JSON.stringify(clean)}::jsonb`;
    }
  }
  if (Object.keys(set).length === 0) return getSettings();

  const [row] = await db
    .update(settings)
    .set(set)
    .where(eq(settings.id, "site"))
    .returning();
  return withDefaults(row);
}

// Inserts an order. Accepts the same shape the Mongo model did
// (`customer: { email, firstName, ... }`) and splits the email out into its
// indexed column.
export async function createOrder(values) {
  const { customer = {}, ...rest } = values;
  const { email = "", ...profile } = customer;
  const [row] = await db
    .insert(orders)
    .values({
      ...rest,
      customerEmail: String(email).toLowerCase().trim(),
      customer: profile,
    })
    .returning();
  return row;
}
