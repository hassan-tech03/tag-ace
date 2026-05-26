import "@/styles/admin.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminProviders from "@/components/admin/AdminProviders";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

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
      <div className="admin-shell flex">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
