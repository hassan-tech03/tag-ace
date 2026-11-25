import { NextResponse } from "next/server";
import { z } from "zod";
import { emailConfigured, sendNewsletterSignupEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(200),
  website: z.string().optional().default(""), // honeypot: real users leave it empty
});

// In-memory rate limit: 3 sign-ups per IP per 10 minutes.
const hits = (globalThis.__mushkNewsletterHits ??= new Map());
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 3;

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

export async function POST(request) {
  if (!emailConfigured()) {
    return NextResponse.json({ error: "Sign-ups are not available right now." }, { status: 503 });
  }

  let data;
  try {
    data = schema.parse(await request.json());
  } catch (err) {
    const msg = err?.issues?.[0]?.message || "Please enter a valid email address";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (data.website) return NextResponse.json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  try {
    await sendNewsletterSignupEmail(data.email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] send failed:", err.message);
    return NextResponse.json({ error: "Could not sign you up. Please try again later." }, { status: 502 });
  }
}
