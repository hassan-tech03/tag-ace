import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/api";
import Setting, { getSettings } from "@/lib/models/Setting";
import { settingsUpdateSchema } from "@/lib/validation";

export const GET = adminRoute(async () => {
  const doc = await getSettings();
  return NextResponse.json(doc);
});

// PUT performs a partial deep-merge: callers can send only the section they
// changed. We bring the doc into existence first via upsert so the response
// always contains a full settings object.
export const PUT = adminRoute(async (request) => {
  const body = await request.json();
  const data = settingsUpdateSchema.parse(body);

  const setOps = {};
  for (const [section, value] of Object.entries(data)) {
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        setOps[`${section}.${k}`] = v;
      }
    } else if (value !== undefined) {
      setOps[section] = value;
    }
  }

  const doc = await Setting.findByIdAndUpdate(
    "site",
    { $set: setOps },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json(doc);
});
