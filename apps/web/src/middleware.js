import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Guards /admin/* and /api/admin/*. The login page itself stays public, but
// authenticated users hitting it are redirected to the dashboard.
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isLogin = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isLogin;
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isLogin && !isAdminPage && !isAdminApi) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthed = !!token && (token.role === "admin" || token.role === "superadmin");

  if (isLogin) {
    if (isAuthed) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (!isAuthed) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
