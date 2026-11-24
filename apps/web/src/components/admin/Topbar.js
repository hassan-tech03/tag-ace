"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { NAV_GROUPS, isActive } from "./Sidebar";

function sectionFor(pathname) {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, label: item.label };
    }
  }
  return { group: "Admin", label: "Panel" };
}

export default function Topbar({ onMenuClick }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the account menu on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const user = session?.user;
  const initials = (user?.name || user?.email || "A")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const section = sectionFor(pathname);

  return (
    <header className="h-16 bg-white/85 backdrop-blur border-b border-slate-200 px-3 sm:px-5 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 -ml-1 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-400">{section.group}</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="font-medium text-slate-800 truncate">{section.label}</span>
        </nav>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50"
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="inline-flex w-8 h-8 rounded-full bg-[#111827] text-[#c9a96e] items-center justify-center text-xs font-semibold">
            {initials}
          </span>
          <span className="hidden sm:block text-sm text-slate-700 max-w-[180px] truncate">{user?.email}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && (
          <div role="menu" className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-xl shadow-lg py-1 overflow-hidden">
            <div className="px-4 py-3 text-xs text-slate-500 border-b border-slate-100">
              Signed in as
              <div className="text-slate-800 font-medium truncate mt-0.5">{user?.email}</div>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-sm text-slate-700 no-underline hover:bg-slate-50"
              role="menuitem"
            >
              View store
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 border-0 bg-transparent"
              type="button"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
