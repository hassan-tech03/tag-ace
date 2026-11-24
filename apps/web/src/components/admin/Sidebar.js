"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "grid" }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: "box" },
      { href: "/admin/categories", label: "Categories", icon: "tag" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: "cart" },
      { href: "/admin/customers", label: "Customers", icon: "users" },
      { href: "/admin/coupons", label: "Coupons", icon: "ticket" },
      { href: "/admin/offers", label: "Special Offers", icon: "spark" },
    ],
  },
  {
    label: "Storefront",
    items: [{ href: "/admin/content", label: "Site Content", icon: "layout" }],
  },
];

export function isActive(pathname, href) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

function Icon({ name }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "tag":
      return (
        <svg {...props}>
          <path d="M20.59 13.41L13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case "cart":
      return (
        <svg {...props}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...props}>
          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...props}>
          <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2" />
        </svg>
      );
    case "layout":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
    case "external":
      return (
        <svg {...props} width={15} height={15}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ open = false, onClose }) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
        <Link href="/admin" className="flex items-center gap-3 text-white no-underline min-w-0">
          <span className="inline-flex w-10 h-10 rounded-xl bg-[#faf6ee] items-center justify-center shrink-0 shadow-sm">
            <Image src="/brand/mushk-icon.png" alt="" width={32} height={32} className="w-8 h-8 object-contain" />
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="font-semibold tracking-wide text-[15px]">Mushk</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#c9a96e]">Admin panel</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="md:hidden text-slate-300 hover:text-white p-1 -mr-1"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
                      active
                        ? "bg-[#c9a96e]/15 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={active ? "text-[#c9a96e]" : "text-slate-400 group-hover:text-slate-200"}>
                      <Icon name={item.icon} />
                    </span>
                    <span className="truncate">{item.label}</span>
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 no-underline hover:bg-white/5 hover:text-white"
        >
          <span>View store</span>
          <Icon name="external" />
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: fixed to the viewport so it never scrolls with the page. */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-30 w-64 bg-[#111827] text-slate-200 border-r border-black/20">
        {content}
      </aside>

      {/* Mobile drawer: slides in from the left, with backdrop. */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />
        <aside
          className={`relative z-50 flex flex-col w-72 max-w-[85vw] h-full bg-[#111827] text-slate-200 shadow-2xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-label="Admin navigation"
        >
          {content}
        </aside>
      </div>
    </>
  );
}
