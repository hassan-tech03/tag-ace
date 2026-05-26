import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "" }, // free-form (Mongo id or storefront id)
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    sku: { type: String, default: "" },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    zipCode: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: { type: [OrderItemSchema], required: true, default: [] },

    subtotal: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "USD" },

    paymentMethod: {
      type: String,
      enum: ["cod", "stripe"],
      required: true,
    },
    paymentStatus: {
      type: String,
      // "pending" = awaiting Stripe; "paid" = Stripe completed; "cod_pending" = waiting on delivery;
      // "cod_collected" = cash received; "failed" / "refunded" self-explanatory.
      enum: ["pending", "paid", "failed", "refunded", "cod_pending", "cod_collected"],
      default: "pending",
      index: true,
    },
    stripeSessionId: { type: String, default: "", index: true },
    stripePaymentIntentId: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },

    customer: {
      email: { type: String, required: true, lowercase: true, trim: true, index: true },
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    shippingAddress: { type: AddressSchema, default: () => ({}) },
    billingAddress: { type: AddressSchema, default: () => ({}) },

    customerNotes: { type: String, default: "" },
    adminNotes: { type: String, default: "" },

    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customer.email": 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
