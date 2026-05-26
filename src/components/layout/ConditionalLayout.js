"use client";

import { usePathname } from "next/navigation";
import Layout from "./Layout";

// Renders the storefront chrome (Header + Footer) on storefront routes, but
// hands children straight through on /admin/* so the admin panel can own its
// own shell.
export default function ConditionalLayout({ children }) {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return <Layout>{children}</Layout>;
}
