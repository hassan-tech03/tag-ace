import mongoose from "mongoose";

// Singleton-by-convention: there is exactly one Setting document with the
// fixed _id "site". Helpers below ensure callers always read/write through
// that single doc.
const SettingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "site" },

    announcementBar: {
      text: { type: String, default: "" },
      link: { type: String, default: "" },
      isActive: { type: Boolean, default: false },
    },

    storeInfo: {
      name: { type: String, default: "Mushk Perfumes" },
      tagline: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
    },

    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },

    seo: {
      defaultTitle: { type: String, default: "" },
      defaultDescription: { type: String, default: "" },
      ogImage: { type: String, default: "" },
    },

    shipping: {
      freeShippingThreshold: { type: Number, default: 100 },
      flatRate: { type: Number, default: 10 },
      taxRate: { type: Number, default: 0.08 },
    },
  },
  { timestamps: true, _id: false }
);

const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

export async function getSettings() {
  let doc = await Setting.findById("site").lean();
  if (!doc) {
    doc = (await Setting.create({ _id: "site" })).toObject();
  }
  return doc;
}

export default Setting;
