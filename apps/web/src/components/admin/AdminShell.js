"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // Auto-close the drawer whenever the route changes — otherwise tapping a
  // link on mobile would leave the overlay visible on top of the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll while the drawer is open on mobile.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="admin-shell">
      <Sidebar open={open} onClose={close} />
      {/* Desktop sidebar is position:fixed (w-64), so offset the content. */}
      <div className="md:pl-64 min-h-screen flex flex-col min-w-0">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-3 sm:p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
