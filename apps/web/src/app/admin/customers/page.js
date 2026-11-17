"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button, Input, Select } from "@/components/admin/ui/Field";
import Pagination from "@/components/admin/ui/Pagination";
import { useToast } from "@/components/admin/ui/Toast";

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d);
  }
}

function initials(firstName, lastName, email) {
  const a = (firstName || "").trim()[0];
  const b = (lastName || "").trim()[0];
  if (a || b) return `${a || ""}${b || ""}`.toUpperCase();
  return (email || "?").trim()[0]?.toUpperCase() || "?";
}

export default function CustomersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ customers: 0, orders: 0, spend: 0, paidSpend: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-lastOrderAt");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sort,
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setStats(data.stats || { customers: 0, orders: 0, spend: 0, paidSpend: 0 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Derived from orders. Anyone who has placed an order appears here."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat label="Customers" value={stats.customers} />
        <Stat label="Total orders" value={stats.orders} />
        <Stat label="Total spend" value={formatMoney(stats.spend)} />
        <Stat label="Paid spend" value={formatMoney(stats.paidSpend)} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input
          placeholder="Search email, name, phone…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="sm:col-span-2"
        />
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-lastOrderAt">Most recent order</option>
          <option value="lastOrderAt">Oldest order</option>
          <option value="-totalSpent">Highest spend</option>
          <option value="totalSpent">Lowest spend</option>
          <option value="-orderCount">Most orders</option>
          <option value="orderCount">Fewest orders</option>
          <option value="email">Email A–Z</option>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Customer</th>
              <th className="text-left px-3 py-2 font-medium">Phone</th>
              <th className="text-right px-3 py-2 font-medium">Orders</th>
              <th className="text-right px-3 py-2 font-medium">Total spent</th>
              <th className="text-right px-3 py-2 font-medium">Paid</th>
              <th className="text-left px-3 py-2 font-medium">First order</th>
              <th className="text-left px-3 py-2 font-medium">Last order</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                  {search ? "No customers match this search." : "No customers yet."}
                </td>
              </tr>
            )}
            {items.map((c) => {
              const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ");
              return (
                <tr key={c.email} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="inline-flex w-9 h-9 rounded-full bg-slate-800 text-white items-center justify-center text-xs font-semibold">
                        {initials(c.firstName, c.lastName, c.email)}
                      </div>
                      <div>
                        <div className="text-slate-900">{fullName || c.email}</div>
                        {fullName && (
                          <div className="text-xs text-slate-500">{c.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{c.phone || "—"}</td>
                  <td className="px-3 py-2 text-right text-slate-900">{c.orderCount}</td>
                  <td className="px-3 py-2 text-right text-slate-900">
                    {formatMoney(c.totalSpent)}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">
                    {formatMoney(c.paidSpent)}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{formatDate(c.firstOrderAt)}</td>
                  <td className="px-3 py-2 text-slate-600">{formatDate(c.lastOrderAt)}</td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/admin/customers/${encodeURIComponent(c.email)}`}>
                      <Button size="sm" variant="secondary">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-3">
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
