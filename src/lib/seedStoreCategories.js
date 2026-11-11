import { db, categories } from "@/lib/db";
import { STORE_CATEGORIES } from "@/lib/storefrontCategories";

// Idempotent: ensures the canonical storefront categories (men/women) exist
// with their friendly names. Safe to call on every request - it only inserts
// rows that are missing and never overwrites admin edits.
//
// Cached for the lifetime of the process so we only hit the DB once.
let seeded = false;

export async function ensureStoreCategories() {
  if (seeded) return;
  try {
    await db
      .insert(categories)
      .values(
        STORE_CATEGORIES.map((c) => ({
          name: c.name,
          slug: c.slug,
          isActive: true,
          order: c.order,
        }))
      )
      .onConflictDoNothing({ target: categories.slug });
    seeded = true;
  } catch (err) {
    // If seeding fails (e.g. transient DB hiccup) we just let the next call
    // try again. We do not want to take the storefront/admin down for this.
    console.error("[seedStoreCategories]", err);
  }
}
