import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { dbConnect } from "./mongodb";

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

// Wraps an async handler with DB connection + uniform error handling.
export function adminRoute(handler) {
  return async (request, ctx) => {
    try {
      const guard = await requireAdmin();
      if (guard.response) return guard.response;
      await dbConnect();
      return await handler(request, ctx, guard.session);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function handleError(err) {
  // Mongoose duplicate key
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return NextResponse.json(
      { error: `A record with this ${field} already exists.`, field },
      { status: 409 }
    );
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
  // Mongoose validation
  if (err?.name === "ValidationError") {
    return NextResponse.json(
      { error: err.message, fields: Object.keys(err.errors || {}) },
      { status: 400 }
    );
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("[admin route]", err);
  }
  return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
}

// Parse pagination + sorting params from a URL.
export function parseListParams(url, { defaultSort = "-createdAt" } = {}) {
  const sp = new URL(url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20", 10) || 20));
  const search = sp.get("search")?.trim() || "";
  const sort = sp.get("sort") || defaultSort;
  return { page, limit, skip: (page - 1) * limit, search, sort, sp };
}
