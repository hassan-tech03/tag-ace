import { z } from "zod";

// Categories ----------------------------------------------------------------

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Slug must be url-safe (letters, numbers, dashes)"),
  description: z.string().max(2000).optional().default(""),
  image: z.string().url().optional().or(z.literal("")).default(""),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// Products ------------------------------------------------------------------

const notesSchema = z
  .object({
    top: z.array(z.string()).default([]),
    middle: z.array(z.string()).default([]),
    base: z.array(z.string()).default([]),
  })
  .default({ top: [], middle: [], base: [] });

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Slug must be url-safe (letters, numbers, dashes)"),
  description: z.string().max(5000).optional().default(""),
  shortDescription: z.string().max(500).optional().default(""),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  originalPrice: z.coerce.number().min(0).nullable().optional(),
  category: z.string().max(120).optional().default(""),
  fragranceFamily: z.string().max(60).optional().default(""),
  size: z.string().max(60).optional().default(""),
  brand: z.string().max(120).optional().default(""),
  sku: z.string().max(120).optional().default(""),
  images: z.array(z.string().url()).default([]),
  stock: z.coerce.number().int().min(0).default(0),
  isHotDeal: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviewCount: z.coerce.number().int().min(0).default(0),
  discount: z.coerce.number().min(0).max(100).default(0),
  notes: notesSchema,
  badge: z.string().max(40).optional().default(""),
  status: z.enum(["active", "draft", "archived"]).default("draft"),
});

export const productUpdateSchema = productCreateSchema.partial();

// Orders --------------------------------------------------------------------

const addressSchema = z
  .object({
    line1: z.string().max(200).optional().default(""),
    line2: z.string().max(200).optional().default(""),
    city: z.string().max(120).optional().default(""),
    state: z.string().max(120).optional().default(""),
    country: z.string().max(120).optional().default(""),
    zipCode: z.string().max(40).optional().default(""),
  })
  .default({});

const orderItemInputSchema = z.object({
  productId: z.union([z.string(), z.number()]).optional(),
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1),
  price: z.union([z.string(), z.number()]),
  quantity: z.coerce.number().int().min(1).default(1),
  image: z.string().optional().default(""),
  sku: z.string().optional().default(""),
});

export const orderCreateSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, "Cart is empty"),
  paymentMethod: z.enum(["cod", "stripe"]),
  customer: z.object({
    email: z.string().email("Valid email is required"),
    firstName: z.string().max(120).optional().default(""),
    lastName: z.string().max(120).optional().default(""),
    phone: z.string().max(40).optional().default(""),
  }),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  customerNotes: z.string().max(2000).optional().default(""),
});

export const orderAdminUpdateSchema = z
  .object({
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
    paymentStatus: z
      .enum(["pending", "paid", "failed", "refunded", "cod_pending", "cod_collected"])
      .optional(),
    adminNotes: z.string().max(5000).optional(),
    cancelReason: z.string().max(500).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

// Coupons -------------------------------------------------------------------

// Accepts either a Date instance, an ISO string, an HTML datetime-local string
// ("YYYY-MM-DDTHH:mm"), or null/empty.
const dateOrNull = z.preprocess(
  (v) => {
    if (v == null || v === "") return null;
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d;
  },
  z.date().nullable()
);

export const couponCreateSchema = z.object({
  code: z
    .string()
    .min(2, "Code is too short")
    .max(60)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, dashes or underscores only"),
  description: z.string().max(500).optional().default(""),
  type: z.enum(["percent", "fixed", "free_shipping"]).default("percent"),
  value: z.coerce.number().min(0).default(0),
  minPurchase: z.coerce.number().min(0).default(0),
  maxDiscount: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().min(0).nullable()
  ).default(null),
  validFrom: dateOrNull.default(null),
  validUntil: dateOrNull.default(null),
  usageLimit: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().int().min(0).nullable()
  ).default(null),
  perCustomerLimit: z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().int().min(0).nullable()
  ).default(null),
  applicableCategories: z.array(z.string()).default([]),
  applicableProducts: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const couponUpdateSchema = couponCreateSchema.partial();

// Offers --------------------------------------------------------------------

export const offerCreateSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  type: z
    .enum(["banner", "hero", "flash_sale", "bogo", "featured", "announcement"])
    .default("banner"),
  image: z.string().url().optional().or(z.literal("")).default(""),
  link: z.string().max(500).optional().default(""),
  ctaText: z.string().max(60).optional().default(""),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  startsAt: dateOrNull.default(null),
  endsAt: dateOrNull.default(null),
  applicableProducts: z.array(z.string()).default([]),
  applicableCategories: z.array(z.string()).default([]),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const offerUpdateSchema = offerCreateSchema.partial();

// Testimonials -------------------------------------------------------------

export const testimonialCreateSchema = z.object({
  name: z.string().min(1).max(120),
  location: z.string().max(120).optional().default(""),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  body: z.string().min(1).max(2000),
  image: z.string().url().optional().or(z.literal("")).default(""),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

// Site settings ------------------------------------------------------------

const urlOrEmpty = z.string().max(500).optional().default("");

export const settingsUpdateSchema = z.object({
  announcementBar: z
    .object({
      text: z.string().max(300).optional().default(""),
      link: z.string().max(500).optional().default(""),
      isActive: z.boolean().optional().default(false),
    })
    .optional(),
  storeInfo: z
    .object({
      name: z.string().max(120).optional().default(""),
      tagline: z.string().max(200).optional().default(""),
      email: z.string().max(200).optional().default(""),
      phone: z.string().max(50).optional().default(""),
      address: z.string().max(500).optional().default(""),
    })
    .optional(),
  social: z
    .object({
      facebook: urlOrEmpty,
      instagram: urlOrEmpty,
      twitter: urlOrEmpty,
      youtube: urlOrEmpty,
      tiktok: urlOrEmpty,
    })
    .optional(),
  seo: z
    .object({
      defaultTitle: z.string().max(200).optional().default(""),
      defaultDescription: z.string().max(500).optional().default(""),
      ogImage: z.string().url().optional().or(z.literal("")).default(""),
    })
    .optional(),
  shipping: z
    .object({
      freeShippingThreshold: z.coerce.number().min(0).optional(),
      flatRate: z.coerce.number().min(0).optional(),
      taxRate: z.coerce.number().min(0).max(1).optional(),
    })
    .optional(),
});
