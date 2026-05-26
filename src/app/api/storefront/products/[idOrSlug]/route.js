import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { mapProductToStorefront } from "@/lib/storefront/adapter";

// Resolves by Mongo _id (24-char hex) or slug. Returns 404 when the product
// doesn't exist or isn't published - the storefront page renders the
// "Product Not Found" view in that case.
export async function GET(_req, { params }) {
  try {
    await dbConnect();
    const key = decodeURIComponent(params.idOrSlug || "");
    let doc = null;
    if (mongoose.isValidObjectId(key)) {
      doc = await Product.findById(key).lean();
    }
    if (!doc) {
      doc = await Product.findOne({ slug: key.toLowerCase() }).lean();
    }
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.status !== "active") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(mapProductToStorefront(doc));
  } catch (err) {
    console.error("[storefront product detail]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
