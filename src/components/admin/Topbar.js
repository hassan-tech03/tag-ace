"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Topbar({ onMenuClick }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user;
  const initials = (user?.name || user?.email || "A")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center w-9 h-9 -ml-1 rounded-md text-slate-700 hover:bg-slate-100"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="text-sm text-slate-500 truncate">Admin Panel</div>
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100"
          type="button"
        >
          <span className="inline-flex w-8 h-8 rounded-full bg-slate-800 text-white items-center justify-center text-xs font-semibold">
            {initials}
          </span>
          <span className="hidden sm:block text-sm text-slate-700 max-w-[180px] truncate">
            {user?.email}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-md shadow-lg py-1">
            <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">
              Signed in as
              <div className="text-slate-800 font-medium truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
