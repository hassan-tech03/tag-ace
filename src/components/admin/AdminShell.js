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
    <div className="admin-shell md:flex">
      <Sidebar open={open} onClose={close} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
