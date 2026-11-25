#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seeds the real Mushk catalogue (seed-data/catalog.mjs).
 *
 *   npm run seed:catalog             upsert the 15 products by slug
 *   node packages/db/scripts/seed-catalog.mjs --prune
 *                                    also delete every product not in it
 *
 * Reads DATABASE_URL from the environment (or apps/web/.env.local).
 * Orders are unaffected by --prune: each order stores its own item snapshot.
 */
import { sql, notInArray } from "drizzle-orm";
import { connect } from "./_db.mjs";
import { CATALOG, CATALOG_DEFAULTS } from "../seed-data/catalog.mjs";

const { db, pool, schema } = connect();
const { products, categories } = schema;
const prune = process.argv.includes("--prune");

function describe(p) {
  const character = p.character.join(", ").toLowerCase();
  return [
    `${p.lead} ${p.tagline}.`,
    `Character: ${character.charAt(0).toUpperCase()}${character.slice(1)}.`,
    `${CATALOG_DEFAULTS.size} Eau de Parfum by ${CATALOG_DEFAULTS.brand}.`,
  ].join("\n\n");
}

async function main() {
  await db
    .insert(categories)
    .values([
      { slug: "men", name: "Men's Fragrances", order: 1, isActive: true },
      { slug: "women", name: "Women's Fragrances", order: 2, isActive: true },
    ])
    .onConflictDoNothing({ target: categories.slug });

  const now = Date.now();
  let created = 0;
  let updated = 0;
  for (let i = 0; i < CATALOG.length; i++) {
    const p = CATALOG[i];
    const payload = {
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brand: CATALOG_DEFAULTS.brand,
      price: CATALOG_DEFAULTS.price,
      originalPrice: null,
      category: p.category,
      fragranceFamily: p.fragranceFamily,
      size: CATALOG_DEFAULTS.size,
      images: p.images,
      stock: CATALOG_DEFAULTS.stock,
      isHotDeal: false,
      isNewArrival: p.isNewArrival,
      rating: 0,
      reviewCount: 0,
      discount: 0,
      notes: { top: [], middle: [], base: [] },
      badge: p.isNewArrival ? "New" : "",
      status: "active",
      shortDescription: `${p.tagline}.`,
      description: describe(p),
      // Earlier in the list = newer, so the storefront's -createdAt sort
      // shows products in catalogue order.
      createdAt: new Date(now - i * 1000),
    };
    const { slug: _s, ...set } = payload;
    const [row] = await db
      .insert(products)
      .values(payload)
      .onConflictDoUpdate({ target: products.slug, set: { ...set, updatedAt: new Date() } })
      .returning({ inserted: sql`(xmax = 0)` });
    row.inserted ? created++ : updated++;
    console.log(`  ${row.inserted ? "+ created" : "~ updated"}  ${p.category.padEnd(6)} ${p.name}`);
  }
  console.log(`Done: ${created} created, ${updated} updated.`);

  if (prune) {
    const removed = await db
      .delete(products)
      .where(notInArray(products.slug, CATALOG.map((p) => p.slug)))
      .returning({ slug: products.slug });
    console.log(`Pruned ${removed.length} product(s) not in the catalogue.`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
