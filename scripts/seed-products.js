#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seeds the live storefront with a curated catalogue of men's and women's
 * fragrances (Office for Men, Bleu de Chanel, Coco Mademoiselle, etc.).
 *
 * Reads MONGODB_URI from .env.local (or the environment).
 * Run with: `npm run seed:products`
 *
 * Safe to re-run: products are upserted by `slug`, so existing rows get
 * updated rather than duplicated.
 */

import mongoose from "mongoose";
import slugify from "slugify";
import fs from "node:fs";
import path from "node:path";

// --- env loader (mirrors seed-admin.js) -----------------------------------
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();
const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("✖ MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

// --- minimal schemas (must mirror src/lib/models) -------------------------
const NotesSchema = new mongoose.Schema(
  {
    top: { type: [String], default: [] },
    middle: { type: [String], default: [] },
    base: { type: [String], default: [] },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null, min: 0 },
    category: { type: String, default: "", index: true, trim: true, lowercase: true },
    fragranceFamily: { type: String, default: "" },
    size: { type: String, default: "" },
    brand: { type: String, default: "" },
    sku: { type: String, default: "", trim: true },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    isHotDeal: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: NotesSchema, default: () => ({}) },
    badge: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

// --- local image rotation -------------------------------------------------
const LOCAL_IMAGES = [
  "/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp",
  "/3_4a5e3cd4-c4da-4955-a739-3dcdebf6f303_360x.webp",
  "/259.webp",
  "/11.webp",
];

function imagesFor(idx) {
  // Two-image set so the card's hover swap always has a second image.
  const a = LOCAL_IMAGES[idx % LOCAL_IMAGES.length];
  const b = LOCAL_IMAGES[(idx + 1) % LOCAL_IMAGES.length];
  return [a, b];
}

// --- curated catalogue ----------------------------------------------------
// Notes are mapped to the storefront's canonical structure. Prices are the
// midpoint of the supplied USD ranges. `category` is the storefront slug
// (men / women / unisex). `fragranceFamily` aligns with the predefined list
// used by the admin form and the gender-page sidebar.
const CATALOGUE = [
  // ============ MEN ============
  {
    name: "Office for Men",
    brand: "Fragrance One",
    price: 255,
    category: "men",
    fragranceFamily: "Woody",
    badge: "Niche",
    shortDescription: "Sophisticated, polished and confidently understated.",
    notes: {
      top: ["Ambroxan", "Bergamot", "Orris Root"],
      middle: ["Woody Notes", "Floral Notes", "Ambergris", "Jasmine", "Amber"],
      base: ["Musk", "Patchouli", "Cashalox", "Woody Notes"],
    },
  },
  {
    name: "Ombre Nomade",
    brand: "Louis Vuitton",
    price: 415,
    category: "men",
    fragranceFamily: "Oriental",
    badge: "Luxury",
    shortDescription: "A nomadic ode to oud, smoke and warm rose.",
    notes: {
      top: ["Saffron", "Raspberry"],
      middle: ["Rose", "Geranium", "Incense"],
      base: ["Agarwood (Oud)", "Amberwood", "Benzoin", "Birch"],
    },
  },
  {
    name: "Catchy Kehwa",
    brand: "Local Artisan",
    price: 22.5,
    category: "men",
    fragranceFamily: "Spicy",
    badge: "Local",
    shortDescription: "A warm, kehwa-inspired blend of cardamom and woods.",
    notes: {
      top: ["Cardamom", "Cinnamon", "Lemon"],
      middle: ["Green Tea", "Saffron", "Rose"],
      base: ["Amber", "Light Musk", "Warm Woods"],
    },
  },
  {
    name: "Janaan Sports",
    brand: "J. Junaid Jamshed",
    price: 30,
    category: "men",
    fragranceFamily: "Aquatic",
    shortDescription: "Energetic marine freshness for everyday wear.",
    notes: {
      top: ["Bergamot", "Lemon", "Mint", "Marine Notes"],
      middle: ["Jasmine", "Pink Pepper", "Ginger"],
      base: ["Cedarwood", "Musk", "Amber", "Patchouli"],
    },
  },
  {
    name: "Imagination",
    brand: "Louis Vuitton",
    price: 335,
    category: "men",
    fragranceFamily: "Citrus",
    badge: "Luxury",
    shortDescription: "A sunlit citrus opening that drifts into spiced tea.",
    notes: {
      top: ["Citron", "Calabrian Bergamot", "Sicilian Orange"],
      middle: ["Tunisian Neroli", "Nigerian Ginger", "Ceylon Cinnamon"],
      base: ["Chinese Black Tea", "Ambroxan", "Guaiac Wood", "Olibanum"],
    },
  },
  {
    name: "Pacific Chill",
    brand: "Louis Vuitton",
    price: 335,
    category: "men",
    fragranceFamily: "Fresh",
    badge: "Luxury",
    shortDescription: "A cool, gourmet breeze with fig, dates and herbs.",
    notes: {
      top: ["Orange", "Citron", "Mint", "Lemon", "Black Currant", "Coriander"],
      middle: ["Apricot", "Basil", "Carrot Seeds", "May Rose"],
      base: ["Fig", "Dates", "Ambrette"],
    },
  },
  {
    name: "Bleu de Chanel",
    brand: "Chanel",
    price: 132.5,
    category: "men",
    fragranceFamily: "Woody",
    badge: "Best Seller",
    shortDescription: "Refined, woody-aromatic signature for the modern man.",
    notes: {
      top: ["Grapefruit", "Lemon", "Mint", "Pink Pepper"],
      middle: ["Ginger", "Nutmeg", "Jasmine", "Iso E Super"],
      base: ["Incense", "Vetiver", "Cedar", "Sandalwood", "Patchouli", "Labdanum"],
    },
  },
  {
    name: "Creed Aventus",
    brand: "Creed",
    price: 490,
    category: "men",
    fragranceFamily: "Fruity",
    badge: "Iconic",
    shortDescription: "Bold pineapple and birch — a true modern classic.",
    notes: {
      top: ["Pineapple", "Bergamot", "Black Currant", "Apple"],
      middle: ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"],
      base: ["Musk", "Oakmoss", "Ambergris", "Vanilla"],
    },
  },
  {
    name: "Montblanc Legend",
    brand: "Montblanc",
    price: 100,
    category: "men",
    fragranceFamily: "Woody",
    shortDescription: "A fresh, fougère take on the gentleman's wardrobe.",
    notes: {
      top: ["Lavender", "Pineapple", "Bergamot", "Lemon Verbena"],
      middle: ["Red Apple", "Dried Fruits", "Oak Moss", "Geranium", "Coumarin", "Rose"],
      base: ["Tonka Bean", "Sandalwood"],
    },
  },
  {
    name: "Acqua di Giò",
    brand: "Giorgio Armani",
    price: 125,
    category: "men",
    fragranceFamily: "Aquatic",
    badge: "Best Seller",
    shortDescription: "Mediterranean sea breeze in a bottle.",
    notes: {
      top: ["Lime", "Lemon", "Bergamot", "Jasmine", "Orange", "Mandarin Orange", "Neroli"],
      middle: ["Sea Notes", "Jasmine", "Calone", "Peach", "Freesia", "Rosemary", "Coriander", "Violet", "Rose"],
      base: ["White Musk", "Cedar", "Oakmoss", "Patchouli", "Amber"],
    },
  },
  {
    name: "Dylan Blue",
    brand: "Versace",
    price: 105,
    category: "men",
    fragranceFamily: "Aquatic",
    shortDescription: "Crisp aquatic facets layered over warm spice.",
    notes: {
      top: ["Calabrian Bergamot", "Water Notes", "Grapefruit", "Fig Leaf"],
      middle: ["Ambroxan", "Black Pepper", "Patchouli", "Papyrus", "Violet Leaf"],
      base: ["Incense", "Musk", "Tonka Bean", "Saffron"],
    },
  },

  // ============ WOMEN ============
  {
    name: "Bombshell",
    brand: "Victoria's Secret",
    price: 70,
    category: "women",
    fragranceFamily: "Fruity",
    badge: "Best Seller",
    shortDescription: "Juicy, flirty and unapologetically bright.",
    notes: {
      top: ["Passionfruit", "Grapefruit", "Pineapple", "Tangerine", "Strawberry"],
      middle: ["Peony", "Vanilla Orchid", "Red Berries", "Jasmine", "Lily-of-the-Valley"],
      base: ["Musk", "Woody Notes", "Oakmoss"],
    },
  },
  {
    name: "Gucci Flora",
    brand: "Gucci",
    price: 147.5,
    category: "women",
    fragranceFamily: "Floral",
    badge: "Luxury",
    shortDescription: "A modern, peony-forward floral with osmanthus warmth.",
    notes: {
      top: ["Peony", "Citruses", "Mandarin Orange"],
      middle: ["Osmanthus", "Rose"],
      base: ["Sandalwood", "Patchouli", "Pink Pepper"],
    },
  },
  {
    name: "Gucci Bloom",
    brand: "Gucci",
    price: 147.5,
    category: "women",
    fragranceFamily: "Floral",
    badge: "Luxury",
    shortDescription: "A lush garden of jasmine and tuberose in full bloom.",
    notes: {
      top: ["Jasmine"],
      middle: ["Tuberose"],
      base: ["Rangoon Creeper"],
    },
  },
  {
    name: "Cherry in Japan",
    brand: "Escada",
    price: 75,
    category: "women",
    fragranceFamily: "Floral",
    badge: "Limited",
    shortDescription: "Delicate sakura petals over warm tonka bean.",
    notes: {
      top: ["Cherry Blossom (Sakura)"],
      middle: ["Jasmine Petals"],
      base: ["Tonka Bean"],
    },
  },
  {
    name: "Orchid Gardenia",
    brand: "Zara",
    price: 27.5,
    category: "women",
    fragranceFamily: "Floral",
    shortDescription: "Crisp orchid, gardenia and a soft vanilla finish.",
    notes: {
      top: ["Bergamot", "Pear", "Lemon"],
      middle: ["Orchid", "Gardenia", "Jasmine"],
      base: ["Vanilla", "Musk", "Cedarwood"],
    },
  },
  {
    name: "Chanel Chance",
    brand: "Chanel",
    price: 152.5,
    category: "women",
    fragranceFamily: "Floral",
    badge: "Iconic",
    shortDescription: "A whirl of hyacinth, jasmine and powdery iris.",
    notes: {
      top: ["Quince", "Grapefruit"],
      middle: ["Hyacinth", "Jasmine"],
      base: ["Musk", "Iris", "Virginia Cedar", "Amber"],
    },
  },
  {
    name: "Coco Mademoiselle",
    brand: "Chanel",
    price: 160,
    category: "women",
    fragranceFamily: "Oriental",
    badge: "Iconic",
    shortDescription: "A modern oriental with patchouli, rose and citrus sparkle.",
    notes: {
      top: ["Orange", "Mandarin Orange", "Bergamot", "Orange Blossom"],
      middle: ["Turkish Rose", "Jasmine", "Mimosa", "Ylang-Ylang"],
      base: ["Patchouli", "White Musk", "Vanilla", "Vetiver", "Tonka Bean", "Opoponax"],
    },
  },
  {
    name: "Lacoste Blanc",
    brand: "Lacoste",
    price: 85,
    category: "women",
    fragranceFamily: "Citrus",
    shortDescription: "Sparkling grapefruit with a creamy suede dry-down.",
    notes: {
      top: ["Grapefruit", "Rosemary", "Cardamom"],
      middle: ["Ylang-Ylang", "Tuberose"],
      base: ["Suede", "Virginia Cedar", "Leather", "Vetiver"],
    },
  },
];

function buildLongDescription(p) {
  const noteLine = (label, list) =>
    list && list.length ? `${label}: ${list.join(", ")}` : "";
  const lines = [
    p.shortDescription,
    `An ${p.fragranceFamily.toLowerCase()} ${p.category === "men" ? "men's" : "women's"} fragrance crafted by ${p.brand}.`,
    "",
    noteLine("Top notes", p.notes.top),
    noteLine("Heart notes", p.notes.middle),
    noteLine("Base notes", p.notes.base),
  ]
    .filter(Boolean)
    .join("\n");
  return lines;
}

function toSlug(value) {
  return slugify(String(value || ""), { lower: true, strict: true, trim: true });
}

async function ensureStoreCategories() {
  const canonical = [
    { slug: "men", name: "Men's Fragrances", order: 1 },
    { slug: "women", name: "Women's Fragrances", order: 2 },
    { slug: "unisex", name: "Unisex", order: 3 },
  ];
  for (const c of canonical) {
    await Category.updateOne(
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
    );
  }
}

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);

  console.log("→ Ensuring storefront categories…");
  await ensureStoreCategories();

  let created = 0;
  let updated = 0;

  for (let i = 0; i < CATALOGUE.length; i++) {
    const p = CATALOGUE[i];
    const slug = toSlug(p.name);
    const images = imagesFor(i);
    const payload = {
      name: p.name,
      slug,
      brand: p.brand || "",
      price: Number(p.price),
      originalPrice: null,
      category: p.category,
      fragranceFamily: p.fragranceFamily || "",
      size: "100ml",
      sku: `MUSHK-${slug.toUpperCase()}`.slice(0, 32),
      images,
      stock: 25,
      isHotDeal: false,
      isNewArrival: false,
      rating: 4.5,
      reviewCount: 24,
      discount: 0,
      notes: p.notes || { top: [], middle: [], base: [] },
      badge: p.badge || "",
      status: "active",
      shortDescription: p.shortDescription || "",
      description: buildLongDescription(p),
    };

    const existing = await Product.findOne({ slug });
    if (existing) {
      await Product.updateOne({ slug }, { $set: payload });
      updated += 1;
      console.log(`  ↺ updated  ${p.category.padEnd(6)}  ${p.name}`);
    } else {
      await Product.create(payload);
      created += 1;
      console.log(`  + created  ${p.category.padEnd(6)}  ${p.name}`);
    }
  }

  console.log(`\n✔ Done. Created ${created}, updated ${updated}, total ${CATALOGUE.length}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("✖ Seed failed:", err);
  process.exit(1);
});
