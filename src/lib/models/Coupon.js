import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["percent", "fixed", "free_shipping"],
      default: "percent",
    },
    // For "percent" this is 0-100, for "fixed" it's a $ amount, ignored for
    // "free_shipping".
    value: { type: Number, default: 0, min: 0 },

    minPurchase: { type: Number, default: 0, min: 0 },
    // Cap on the absolute discount for percent coupons (null = no cap).
    maxDiscount: { type: Number, default: null, min: 0 },

    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },

    usageLimit: { type: Number, default: null, min: 0 }, // null = unlimited
    perCustomerLimit: { type: Number, default: null, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },

    // Category slugs / product slugs (or IDs). Empty array means "applies to
    // everything".
    applicableCategories: { type: [String], default: [] },
    applicableProducts: { type: [String], default: [] },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CouponSchema.index({ isActive: 1, validUntil: 1 });

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
