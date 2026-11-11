import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import { getSettings, updateSettings } from "@/lib/db/queries";
import { settingsUpdateSchema } from "@/lib/validation";

export const GET = adminRoute(async () => {
  return NextResponse.json(await getSettings());
});

// PUT performs a partial deep-merge: callers can send only the section they
// changed.
export const PUT = adminRoute(async (request) => {
  const data = settingsUpdateSchema.parse(await request.json());
  return NextResponse.json(await updateSettings(data));
});
