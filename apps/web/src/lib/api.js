import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Returns { session } when the request is from an authenticated admin, or
// { response } containing a 401/403 to short-circuit the route. Middleware
// already gates /api/admin/*, but this is belt-and-braces and gives the
// session object to handlers that want user info.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "admin" && session.user.role !== "superadmin") {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

// Wraps an async handler with the admin guard + uniform error handling.
export function adminRoute(handler) {
  return async (request, ctx) => {
    try {
      const guard = await requireAdmin();
      if (guard.response) return guard.response;
      return await handler(request, ctx, guard.session);
    } catch (err) {
      return handleError(err);
    }
  };
}

// Drizzle wraps driver errors; the Postgres error is on `cause`.
function pgError(err) {
  if (err?.code && typeof err.code === "string" && err.code.length === 5) return err;
  if (err?.cause?.code) return err.cause;
  return null;
}

export function handleError(err) {
  const pg = pgError(err);

  // Postgres unique violation, e.g. duplicate slug or coupon code.
  if (pg?.code === "23505") {
    const m = /\(([^)]+)\)=/.exec(pg.detail || "");
    const field = m ? m[1].replace(/_([a-z])/g, (_, c) => c.toUpperCase()) : "field";
    return NextResponse.json(
      { error: `A record with this ${field} already exists.`, field },
      { status: 409 }
    );
  }
  // Check / not-null / enum-ish violations and malformed input.
  if (pg && ["23502", "23514", "22P02", "22003"].includes(pg.code)) {
    return NextResponse.json({ error: pg.message || "Invalid data" }, { status: 400 });
  }
  // Zod
  if (err?.name === "ZodError") {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: err.issues?.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("[admin route]", err);
  }
  // Don't echo raw database errors (they can include SQL); other errors
  // (e.g. Cloudinary) carry messages that are useful to the admin.
  const message = pg ? "Database error" : err?.message || "Internal server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

// Parse pagination + sorting params from a URL.
export function parseListParams(url, { defaultSort = "-createdAt" } = {}) {
  const sp = new URL(url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20", 10) || 20));
  const search = sp.get("search")?.trim() || "";
  const sort = sp.get("sort") || defaultSort;
  return { page, limit, skip: (page - 1) * limit, search, sort, defaultSort, sp };
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
