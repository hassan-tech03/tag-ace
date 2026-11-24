import { NextResponse } from "next/server";
import { z } from "zod";
import { emailConfigured, sendContactEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("A valid email is required").max(200),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(5, "Message is too short").max(5000),
  inquiryType: z.string().trim().max(40).optional().default("general"),
  website: z.string().optional().default(""), // honeypot: real users leave it empty
});

// Simple in-memory rate limit: 5 messages per IP per 10 minutes.
const hits = (globalThis.__mushkContactHits ??= new Map());
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

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
    return NextResponse.json({ error: "Email is not configured" }, { status: 503 });
  }

  let data;
  try {
    data = schema.parse(await request.json());
  } catch (err) {
    const msg = err?.issues?.[0]?.message || "Invalid message";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Bots that fill the hidden field get a fake success.
  if (data.website) return NextResponse.json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  try {
    await sendContactEmail(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err.message);
    return NextResponse.json({ error: "Could not send your message. Please try again later." }, { status: 502 });
  }
}
