import mongoose from "mongoose";

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

    // Stored as a slug string (matches Category.slug) so storefront pages can
    // filter without populating. The admin UI resolves friendly names.
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

ProductSchema.index({ name: "text", description: "text", brand: "text" });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
