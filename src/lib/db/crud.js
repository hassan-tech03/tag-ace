import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminRoute, notFound } from "@/lib/api";
import { db } from "@/lib/db";
import { isUuid, serialize } from "@/lib/db/helpers";

// GET / PATCH / DELETE handlers for a single row addressed by UUID `id`.
// `prepare` can normalise the parsed update payload (e.g. upper-case codes).
export function crudItemRoutes(table, updateSchema, { prepare } = {}) {
  const GET = adminRoute(async (_req, { params }) => {
    if (!isUuid(params.id)) return notFound();
    const [row] = await db.select().from(table).where(eq(table.id, params.id));
    if (!row) return notFound();
    return NextResponse.json(serialize(row));
  });

  const PATCH = adminRoute(async (request, { params }) => {
    if (!isUuid(params.id)) return notFound();
    const data = updateSchema.parse(await request.json());
    if (prepare) prepare(data);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    const [row] = await db.update(table).set(data).where(eq(table.id, params.id)).returning();
    if (!row) return notFound();
    return NextResponse.json(serialize(row));
  });

  const DELETE = adminRoute(async (_req, { params }) => {
    if (!isUuid(params.id)) return notFound();
    const [row] = await db.delete(table).where(eq(table.id, params.id)).returning({ id: table.id });
    if (!row) return notFound();
    return NextResponse.json({ ok: true });
  });

  return { GET, PATCH, DELETE };
}
