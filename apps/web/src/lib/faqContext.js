import { getSettings } from "@mushk/db/queries";
import { ratesFromSettings } from "@/lib/orderUtils";

// Server-side: settings-driven values the FAQ answers need.
export async function getFaqContext() {
  try {
    const s = await getSettings();
    return {
      rates: ratesFromSettings(s.shipping),
      email: s.storeInfo?.email || "",
      phone: s.storeInfo?.phone || "",
    };
  } catch {
    return {};
  }
}
