import Category from "@/lib/models/Category";
import { STORE_CATEGORIES } from "@/lib/storefrontCategories";

// Idempotent: ensures the three canonical storefront categories
// (men/women/unisex) exist with their friendly names. Safe to call on
// every request - it only writes when the docs are missing.
//
// Cached for the lifetime of the process so we only hit Mongo once.
let seeded = false;

export async function ensureStoreCategories() {
  if (seeded) return;
  try {
    await Promise.all(
      STORE_CATEGORIES.map((c) =>
        Category.updateOne(
          { slug: c.slug },
          {
            $setOnInsert: {
              name: c.name,
              slug: c.slug,
              isActive: true,
              order: c.order,
            },
          },
          { upsert: true }
        )
      )
    );
    seeded = true;
  } catch (err) {
    // If seeding fails (e.g. transient DB hiccup) we just let the next call
    // try again. We do not want to take the storefront/admin down for this.
    console.error("[seedStoreCategories]", err);
  }
}
