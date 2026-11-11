import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db/queries";

// Always fetch live - settings are edited from the admin and should never be
// served from a build-time snapshot.
export const dynamic = "force-dynamic";

// Public, read-only settings. Only the storefront-safe sections are exposed.
export async function GET() {
  try {
    const doc = await getSettings();
    return NextResponse.json({
      announcementBar: doc.announcementBar,
      storeInfo: doc.storeInfo,
      social: doc.social,
      seo: doc.seo,
      shipping: doc.shipping,
    });
  } catch (err) {
    console.error("[storefront settings]", err);
    return NextResponse.json(
      { announcementBar: {}, storeInfo: {}, social: {}, seo: {}, shipping: {} },
      { status: 200 }
    );
  }
}
