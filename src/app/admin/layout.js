import "@/styles/admin.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminProviders from "@/components/admin/AdminProviders";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin · Mushk",
  robots: { index: false, follow: false },
};

// Wraps every /admin route. When the user has no session (e.g. /admin/login or
// a middleware-bypassed entry point) we skip the chrome and just render the
// child page on a minimal admin-themed shell.
export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <AdminProviders session={session}>
        <div className="admin-shell">{children}</div>
      </AdminProviders>
    );
  }

  return (
    <AdminProviders session={session}>
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}
