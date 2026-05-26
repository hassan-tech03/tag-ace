import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { getSettings } from "@/lib/models/Setting";

// Always fetch live - settings are edited from the admin and should never be
// served from a build-time snapshot.
export const dynamic = "force-dynamic";

// Public, read-only settings. Strips anything that could be sensitive in the
// future; everything currently in the model is intentionally storefront-safe
// (no secrets), but explicit > implicit.
export async function GET() {
  try {
    await dbConnect();
    const doc = await getSettings();
    return NextResponse.json({
      announcementBar: doc.announcementBar || {},
      storeInfo: doc.storeInfo || {},
      social: doc.social || {},
      seo: doc.seo || {},
      shipping: doc.shipping || {},
    });
  } catch (err) {
    console.error("[storefront settings]", err);
    return NextResponse.json(
      {
        announcementBar: {},
        storeInfo: {},
        social: {},
        seo: {},
        shipping: {},
      },
      { status: 200 }
    );
  }
}
