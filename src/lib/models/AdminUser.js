import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev with HMR.
export default mongoose.models.AdminUser ||
  mongoose.model("AdminUser", AdminUserSchema);
