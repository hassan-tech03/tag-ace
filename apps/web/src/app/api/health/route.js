import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@mushk/db";

export const dynamic = "force-dynamic";

// Liveness + database check, used by the Docker healthcheck and uptime
// monitors. Returns 503 when Postgres is unreachable.
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: "up" });
  } catch (err) {
    console.error("[health] database check failed:", err.message);
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
