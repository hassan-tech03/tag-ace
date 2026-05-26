import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["banner", "hero", "flash_sale", "bogo", "featured", "announcement"],
      default: "banner",
      index: true,
    },
    image: { type: String, default: "" },
    link: { type: String, default: "" },
    ctaText: { type: String, default: "" },

    // Headline percent for display purposes (e.g. "30% OFF" badge). The
    // actual discount machinery lives in coupons.
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },

    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },

    applicableProducts: { type: [String], default: [] },
    applicableCategories: { type: [String], default: [] },

    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

OfferSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Offer || mongoose.model("Offer", OfferSchema);
