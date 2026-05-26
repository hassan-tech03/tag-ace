"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarList,
  RevenueChart,
  StatusBreakdown,
} from "@/components/admin/AnalyticsCharts";

const RANGES = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "365d", label: "1y" },
];

function money(n) {
  return `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatTile({ label, value, sub, accent = "amber" }) {
  const accents = {
    amber: "from-amber-50 to-white border-amber-100",
    emerald: "from-emerald-50 to-white border-emerald-100",
    slate: "from-slate-50 to-white border-slate-200",
    blue: "from-blue-50 to-white border-blue-100",
  };
  return (
    <div className={`bg-gradient-to-b ${accents[accent]} border rounded-lg p-4`}>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-2">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

const ORDER_STATUS_LABEL = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABEL = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cod_pending: "COD pending",
  cod_collected: "COD collected",
};

export default function DashboardPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load analytics");
      setData(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const r = data?.rangeStats;
  const t = data?.totals;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Live performance from your storefront and admin operations.
          </p>
        </div>
        <div className="inline-flex bg-slate-100 rounded-md p-1 self-start">
          {RANGES.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === opt.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          label={`Paid revenue (${range})`}
          value={money(r?.paidRevenue)}
          sub={`${r?.paidOrders || 0} paid order${r?.paidOrders === 1 ? "" : "s"}`}
          accent="amber"
        />
        <StatTile
          label={`Orders (${range})`}
          value={(r?.orders || 0).toLocaleString()}
          sub={`Gross ${money(r?.revenue)}`}
          accent="blue"
        />
        <StatTile
          label={`Customers (${range})`}
          value={(r?.customers || 0).toLocaleString()}
          sub={`${t?.customers || 0} all-time`}
          accent="emerald"
        />
        <StatTile
          label="Avg. order value"
          value={money(r?.aov)}
          sub={`Lifetime: ${money(t?.aov)}`}
          accent="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-900">Revenue & orders</h2>
            <span className="text-xs text-slate-500">last {data?.days || 30} days</span>
          </div>
          {loading || !data ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
              Loading chart…
            </div>
          ) : (
            <RevenueChart series={data.series} />
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <StatusBreakdown
            title="Fulfillment status"
            data={Object.fromEntries(
              Object.entries(data?.orderStatus || {}).map(([k, v]) => [
                ORDER_STATUS_LABEL[k] || k,
                v,
              ])
            )}
          />
          <div className="border-t border-slate-100 my-4" />
          <StatusBreakdown
            title="Payment status"
            data={Object.fromEntries(
              Object.entries(data?.paymentStatus || {}).map(([k, v]) => [
                PAYMENT_LABEL[k] || k,
                v,
              ])
            )}
          />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Top products</h2>
            <Link href="/admin/products" className="text-xs text-amber-700 hover:underline">
              View all →
            </Link>
          </div>
          <BarList
            items={data?.topProducts || []}
            valueKey="revenue"
            labelKey="name"
            format={(v, it) =>
              `${money(v)}  ·  ${it.qty} unit${it.qty === 1 ? "" : "s"}`
            }
          />
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Top categories</h2>
            <Link href="/admin/categories" className="text-xs text-amber-700 hover:underline">
              View all →
            </Link>
          </div>
          <BarList
            items={data?.topCategories || []}
            valueKey="revenue"
            labelKey="category"
            format={(v, it) =>
              `${money(v)}  ·  ${it.orders} order${it.orders === 1 ? "" : "s"}`
            }
          />
        </section>
      </div>

      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs text-amber-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-5 py-2 font-medium">Order</th>
              <th className="text-left px-5 py-2 font-medium">Customer</th>
              <th className="text-left px-5 py-2 font-medium">Total</th>
              <th className="text-left px-5 py-2 font-medium">Payment</th>
              <th className="text-left px-5 py-2 font-medium">Status</th>
              <th className="text-left px-5 py-2 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentOrders || []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">
                  No orders yet.
                </td>
              </tr>
            )}
            {(data?.recentOrders || []).map((o) => (
              <tr key={o._id} className="border-t border-slate-100">
                <td className="px-5 py-2.5">
                  <Link
                    href={`/admin/orders/${o._id}`}
                    className="text-amber-700 hover:underline font-medium"
                  >
                    #{o.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-2.5 text-slate-700">
                  <div className="truncate">
                    {[o.customer?.firstName, o.customer?.lastName]
                      .filter(Boolean)
                      .join(" ") || o.customer?.email}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {o.customer?.email}
                  </div>
                </td>
                <td className="px-5 py-2.5 text-slate-900">{money(o.total)}</td>
                <td className="px-5 py-2.5 text-slate-700">
                  {PAYMENT_LABEL[o.paymentStatus] || o.paymentStatus}
                </td>
                <td className="px-5 py-2.5 text-slate-700">
                  {ORDER_STATUS_LABEL[o.status] || o.status}
                </td>
                <td className="px-5 py-2.5 text-slate-600">
                  {new Date(o.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
          <div className="text-xs text-slate-500">Products in catalog</div>
          <div className="text-xl font-semibold text-slate-900 mt-1">
            {data?.counts?.products ?? "—"}
          </div>
          <Link href="/admin/products" className="text-xs text-amber-700 hover:underline mt-2 inline-block">
            Manage products →
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
          <div className="text-xs text-slate-500">Active coupons</div>
          <div className="text-xl font-semibold text-slate-900 mt-1">
            {data?.counts?.activeCoupons ?? "—"}
          </div>
          <Link href="/admin/coupons" className="text-xs text-amber-700 hover:underline mt-2 inline-block">
            Manage coupons →
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
          <div className="text-xs text-slate-500">All-time paid revenue</div>
          <div className="text-xl font-semibold text-slate-900 mt-1">
            {money(t?.paidRevenue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t?.paidOrders || 0} paid order{t?.paidOrders === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </div>
  );
}
