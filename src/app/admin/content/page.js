"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/ui/PageHeader";
import TestimonialsTab from "@/components/admin/content/TestimonialsTab";
import SettingsTab from "@/components/admin/content/SettingsTab";

const TABS = [
  { id: "testimonials", label: "Testimonials" },
  { id: "settings", label: "Site Settings" },
];

export default function ContentPage() {
  const [tab, setTab] = useState("testimonials");

  return (
    <div>
      <PageHeader
        title="Site Content"
        description="Manage testimonials and global storefront settings."
      />

      <div className="mb-5 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
        Looking for homepage slides or hero banners?{" "}
        <Link href="/admin/offers" className="underline font-medium">
          Manage them under Special Offers →
        </Link>
      </div>

      <div className="border-b border-slate-200 mb-5">
        <nav className="-mb-px flex gap-4">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-amber-400 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {tab === "testimonials" && <TestimonialsTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}
