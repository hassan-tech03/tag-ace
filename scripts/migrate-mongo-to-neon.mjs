#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * One-time copy of the old MongoDB data into Neon.
 *
 * Needs both MONGODB_URI (source, read-only) and DATABASE_URL (Neon) in
 * .env.local. Run the Drizzle migrations first (`npm run db:migrate`), then:
 *
 *   npm run migrate:mongo
 *
 * - MongoDB is only read, never modified.
 * - Each Neon table is skipped if it already has rows, so re-running is safe
 *   and won't duplicate data.
 * - Mongo ObjectIds become new UUIDs; order line items that pointed at a
 *   product id are re-pointed at the product's new UUID.
 * - The store now has only two categories (men, women). The old "unisex"
 *   category is not copied, and products filed under it are imported as
 *   drafts so you can re-assign them in the admin before they go live.
 */
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import { sql } from "drizzle-orm";
import { connect } from "./_db.mjs";

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("✖ MONGODB_URI is not set. It's needed only for this one-time copy.");
  process.exit(1);
}

const KEEP_CATEGORIES = new Set(["men", "women"]);

const { db, pool, schema } = connect();
const mongo = new MongoClient(MONGODB_URI);

const str = (v) => (v == null ? "" : String(v));
const num = (v, d = 0) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Number(v) : d);
const numOrNull = (v) => (v == null || v === "" ? null : num(v));
const date = (v) => (v ? new Date(v) : null);
const arr = (v) => (Array.isArray(v) ? v.map(String) : []);
const stamps = (d) => ({
  createdAt: date(d.createdAt) || new Date(),
  updatedAt: date(d.updatedAt) || date(d.createdAt) || new Date(),
});

async function isEmpty(table) {
  const [{ n }] = await db.select({ n: sql`count(*)::int` }).from(table);
  return n === 0;
}

async function copy(label, collection, table, mapDoc) {
  if (!(await isEmpty(table))) {
    console.log(`  – ${label}: Neon table already has rows, skipping`);
    return;
  }
  const docs = await collection.find({}).toArray();
  const rows = docs.map(mapDoc).filter(Boolean);
  for (let i = 0; i < rows.length; i += 200) {
    await db.insert(table).values(rows.slice(i, i + 200));
  }
  console.log(`  ✔ ${label}: copied ${rows.length} of ${docs.length}`);
}

async function main() {
  await mongo.connect();
  const m = mongo.db();
  console.log(`→ Copying from MongoDB "${m.databaseName}" to Neon…`);

  const productIdMap = new Map(); // old ObjectId string -> new UUID
  const draftedProducts = [];

  await copy("admin users", m.collection("adminusers"), schema.adminUsers, (d) => ({
    id: randomUUID(),
    email: str(d.email).toLowerCase().trim(),
    passwordHash: str(d.passwordHash),
    name: str(d.name),
    role: d.role === "superadmin" ? "superadmin" : "admin",
    lastLoginAt: date(d.lastLoginAt),
    ...stamps(d),
  }));

  await copy("categories", m.collection("categories"), schema.categories, (d) => {
    const slug = str(d.slug).toLowerCase();
    if (slug === "unisex") return null;
    return {
      id: randomUUID(),
      name: str(d.name),
      slug,
      description: str(d.description),
      image: str(d.image),
      order: num(d.order),
      isActive: d.isActive !== false,
      ...stamps(d),
    };
  });

  await copy("products", m.collection("products"), schema.products, (d) => {
    const id = randomUUID();
    productIdMap.set(String(d._id), id);
    const category = str(d.category).toLowerCase();
    let status = ["active", "draft", "archived"].includes(d.status) ? d.status : "draft";
    if (category && !KEEP_CATEGORIES.has(category)) {
      if (status === "active") draftedProducts.push(`${d.name} (${category})`);
      status = status === "archived" ? "archived" : "draft";
    }
    return {
      id,
      name: str(d.name),
      slug: str(d.slug).toLowerCase(),
      description: str(d.description),
      shortDescription: str(d.shortDescription),
      price: num(d.price),
      originalPrice: numOrNull(d.originalPrice),
      category,
      fragranceFamily: str(d.fragranceFamily),
      size: str(d.size),
      brand: str(d.brand),
      sku: str(d.sku),
      images: arr(d.images),
      stock: Math.max(0, Math.trunc(num(d.stock))),
      isHotDeal: !!d.isHotDeal,
      isNewArrival: !!d.isNewArrival,
      rating: num(d.rating),
      reviewCount: Math.trunc(num(d.reviewCount)),
      discount: num(d.discount),
      notes: {
        top: arr(d.notes?.top),
        middle: arr(d.notes?.middle),
        base: arr(d.notes?.base),
      },
      badge: str(d.badge),
      status,
      ...stamps(d),
    };
  });

  // If products were skipped (already present), build the id map from slugs
  // so order items can still be re-pointed.
  if (productIdMap.size === 0) {
    const neonProducts = await db
      .select({ id: schema.products.id, slug: schema.products.slug })
      .from(schema.products);
    const bySlug = new Map(neonProducts.map((p) => [p.slug, p.id]));
    for (const d of await m.collection("products").find({}, { projection: { slug: 1 } }).toArray()) {
      const id = bySlug.get(str(d.slug).toLowerCase());
      if (id) productIdMap.set(String(d._id), id);
    }
  }

  const address = (a = {}) => ({
    line1: str(a.line1),
    line2: str(a.line2),
    city: str(a.city),
    state: str(a.state),
    country: str(a.country),
    zipCode: str(a.zipCode),
  });

  await copy("orders", m.collection("orders"), schema.orders, (d) => ({
    id: randomUUID(),
    orderNumber: str(d.orderNumber),
    items: (d.items || []).map((it) => ({
      productId: productIdMap.get(str(it.productId)) || str(it.productId),
      name: str(it.name),
      price: num(it.price),
      quantity: Math.max(1, Math.trunc(num(it.quantity, 1))),
      image: str(it.image),
      sku: str(it.sku),
    })),
    subtotal: num(d.subtotal),
    shipping: num(d.shipping),
    tax: num(d.tax),
    total: num(d.total),
    currency: str(d.currency) || "USD",
    paymentMethod: d.paymentMethod === "cod" ? "cod" : "stripe",
    paymentStatus: d.paymentStatus || "pending",
    stripeSessionId: str(d.stripeSessionId),
    stripePaymentIntentId: str(d.stripePaymentIntentId),
    status: d.status || "pending",
    customerEmail: str(d.customer?.email).toLowerCase().trim(),
    customer: {
      firstName: str(d.customer?.firstName),
      lastName: str(d.customer?.lastName),
      phone: str(d.customer?.phone),
    },
    shippingAddress: address(d.shippingAddress),
    billingAddress: address(d.billingAddress),
    customerNotes: str(d.customerNotes),
    adminNotes: str(d.adminNotes),
    cancelledAt: date(d.cancelledAt),
    cancelReason: str(d.cancelReason),
    ...stamps(d),
  }));

  await copy("coupons", m.collection("coupons"), schema.coupons, (d) => ({
    id: randomUUID(),
    code: str(d.code).toUpperCase().trim(),
    description: str(d.description),
    type: ["percent", "fixed", "free_shipping"].includes(d.type) ? d.type : "percent",
    value: num(d.value),
    minPurchase: num(d.minPurchase),
    maxDiscount: numOrNull(d.maxDiscount),
    validFrom: date(d.validFrom),
    validUntil: date(d.validUntil),
    usageLimit: numOrNull(d.usageLimit),
    perCustomerLimit: numOrNull(d.perCustomerLimit),
    usedCount: Math.trunc(num(d.usedCount)),
    applicableCategories: arr(d.applicableCategories).filter((c) => c !== "unisex"),
    applicableProducts: arr(d.applicableProducts).map((p) => productIdMap.get(p) || p),
    isActive: d.isActive !== false,
    ...stamps(d),
  }));

  await copy("offers", m.collection("offers"), schema.offers, (d) => ({
    id: randomUUID(),
    title: str(d.title),
    subtitle: str(d.subtitle),
    description: str(d.description),
    type: d.type || "banner",
    image: str(d.image),
    link: str(d.link),
    ctaText: str(d.ctaText),
    discountPercent: num(d.discountPercent),
    startsAt: date(d.startsAt),
    endsAt: date(d.endsAt),
    applicableProducts: arr(d.applicableProducts).map((p) => productIdMap.get(p) || p),
    applicableCategories: arr(d.applicableCategories).filter((c) => c !== "unisex"),
    order: Math.trunc(num(d.order)),
    isActive: d.isActive !== false,
    ...stamps(d),
  }));

  await copy("testimonials", m.collection("testimonials"), schema.testimonials, (d) => ({
    id: randomUUID(),
    name: str(d.name),
    location: str(d.location),
    rating: Math.min(5, Math.max(1, Math.trunc(num(d.rating, 5)))),
    body: str(d.body),
    image: str(d.image),
    order: Math.trunc(num(d.order)),
    isActive: d.isActive !== false,
    ...stamps(d),
  }));

  await copy("settings", m.collection("settings"), schema.settings, (d) => {
    if (String(d._id) !== "site") return null;
    const { SETTINGS_DEFAULTS } = schema;
    const out = { id: "site", ...stamps(d) };
    for (const key of Object.keys(SETTINGS_DEFAULTS)) {
      out[key] = { ...SETTINGS_DEFAULTS[key], ...(d[key] || {}) };
    }
    return out;
  });

  if (draftedProducts.length) {
    console.log(
      `\n⚠ ${draftedProducts.length} active product(s) were in a removed category and were imported as DRAFT.`
    );
    console.log("  Assign them to Men or Women in /admin/products, then set them Active:");
    for (const p of draftedProducts) console.log(`    - ${p}`);
  }
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error("✖ Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongo.close().catch(() => {});
    await pool.end();
  });
