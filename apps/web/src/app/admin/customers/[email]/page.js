"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function formatDateShort(d) {
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

const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

const PAYMENT_BADGE = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cod_pending: "bg-amber-50 text-amber-700 border-amber-200",
  cod_collected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const emailParam = params.email; // already URL-decoded by Next

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/customers/${encodeURIComponent(emailParam || "")}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
    } catch (err) {
      toast.error(err.message);
      router.push("/admin/customers");
    } finally {
      setLoading(false);
    }
  }, [emailParam, router, toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="text-sm text-slate-500">Loading…</div>;
  if (!data) return null;

  const c = data.customer;
  const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
  const init = ((c.firstName?.[0] || "") + (c.lastName?.[0] || "")).toUpperCase() ||
    (c.email?.[0] || "?").toUpperCase();

  return (
    <div>
      <PageHeader title={fullName} description={c.email}>
        <Link href="/admin/customers">
          <Button variant="secondary">← Back to customers</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Order history">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Order #</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                  <th className="text-right px-3 py-2 font-medium">Items</th>
                  <th className="text-right px-3 py-2 font-medium">Total</th>
                  <th className="text-left px-3 py-2 font-medium">Payment</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o._id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-900">
                      {o.orderNumber}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{formatDateShort(o.createdAt)}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{o.itemCount}</td>
                    <td className="px-3 py-2 text-right text-slate-900">
                      {formatMoney(o.total)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500">
                          {o.paymentMethod === "stripe" ? "Stripe" : "COD"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border w-fit ${
                            PAYMENT_BADGE[o.paymentStatus] ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                          STATUS_BADGE[o.status] ||
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/admin/orders/${o._id}`}>
                        <Button size="sm" variant="secondary">
                          Open
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex w-12 h-12 rounded-full bg-slate-800 text-white items-center justify-center text-base font-semibold">
                {init}
              </div>
              <div>
                <div className="text-slate-900 font-medium">{fullName}</div>
                <div className="text-xs text-slate-500">{c.email}</div>
              </div>
            </div>
            <KV label="Phone" value={c.phone || "—"} />
            <KV label="First order" value={formatDate(c.firstOrderAt)} />
            <KV label="Last order" value={formatDate(c.lastOrderAt)} />
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Lifetime value</h3>
            <KV label="Orders" value={c.orderCount} />
            <KV label="Total spent" value={formatMoney(c.totalSpent)} />
            <KV label="Paid spend" value={formatMoney(c.paidSpent)} />
            <KV
              label="Avg order"
              value={c.orderCount > 0 ? formatMoney(c.totalSpent / c.orderCount) : "—"}
            />
          </section>

          {data.addresses?.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Shipping addresses ({data.addresses.length})
              </h3>
              <div className="space-y-3">
                {data.addresses.map((a, i) => (
                  <div
                    key={i}
                    className="text-sm text-slate-700 border-l-2 border-slate-200 pl-3"
                  >
                    {[
                      a.line1,
                      a.line2,
                      [a.city, a.state, a.zipCode].filter(Boolean).join(", "),
                      a.country,
                    ]
                      .filter(Boolean)
                      .map((l, j) => (
                        <div key={j}>{l}</div>
                      ))}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <h2 className="text-sm font-semibold text-slate-900 px-4 py-3 border-b border-slate-100">
        {title}
      </h2>
      {children}
    </section>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 text-right">{value}</span>
    </div>
  );
}
