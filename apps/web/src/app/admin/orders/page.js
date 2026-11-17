"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button, Input, Select } from "@/components/admin/ui/Field";
import Pagination from "@/components/admin/ui/Pagination";
import { useToast } from "@/components/admin/ui/Toast";

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

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}

export default function OrdersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [paidRevenue, setPaidRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [sort, setSort] = useState("-createdAt");
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
      if (status) params.set("status", status);
      if (paymentMethod) params.set("paymentMethod", paymentMethod);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setRevenue(data.revenue || 0);
      setPaidRevenue(data.paidRevenue || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, paymentMethod, paymentStatus, sort, toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Orders from Stripe Checkout and Cash on Delivery."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat label="Total orders" value={total} />
        <Stat label="Paid revenue" value={formatMoney(paidRevenue)} />
        <Stat label="Filtered revenue" value={formatMoney(revenue)} />
        <Stat
          label="Avg order value"
          value={total > 0 ? formatMoney(revenue / total) : "—"}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 grid grid-cols-1 sm:grid-cols-5 gap-2">
        <Input
          placeholder="Search by order #, email, name…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="sm:col-span-2"
        />
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select
          value={paymentMethod}
          onChange={(e) => {
            setPage(1);
            setPaymentMethod(e.target.value);
          }}
        >
          <option value="">All methods</option>
          <option value="stripe">Stripe</option>
          <option value="cod">Cash on Delivery</option>
        </Select>
        <Select
          value={paymentStatus}
          onChange={(e) => {
            setPage(1);
            setPaymentStatus(e.target.value);
          }}
        >
          <option value="">All payment statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cod_pending">COD pending</option>
          <option value="cod_collected">COD collected</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </div>

      <div className="flex justify-end mb-2">
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="sm:w-56">
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="-total">Total high → low</option>
          <option value="total">Total low → high</option>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Order #</th>
              <th className="text-left px-3 py-2 font-medium">Date</th>
              <th className="text-left px-3 py-2 font-medium">Customer</th>
              <th className="text-left px-3 py-2 font-medium">Items</th>
              <th className="text-right px-3 py-2 font-medium">Total</th>
              <th className="text-left px-3 py-2 font-medium">Payment</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                  {search || status || paymentMethod || paymentStatus
                    ? "No orders match these filters."
                    : "No orders yet. Place a test order from the storefront to see it here."}
                </td>
              </tr>
            )}
            {items.map((o) => (
              <tr key={o._id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs text-slate-900">{o.orderNumber}</td>
                <td className="px-3 py-2 text-slate-600">{formatDate(o.createdAt)}</td>
                <td className="px-3 py-2">
                  <div className="text-slate-900">
                    {[o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(" ") ||
                      "—"}
                  </div>
                  <div className="text-xs text-slate-500">{o.customer?.email}</div>
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {o.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0}
                </td>
                <td className="px-3 py-2 text-right text-slate-900">{formatMoney(o.total)}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">
                      {o.paymentMethod === "stripe" ? "Stripe" : "COD"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border w-fit ${
                        PAYMENT_BADGE[o.paymentStatus] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                      STATUS_BADGE[o.status] || "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/orders/${o._id}`}>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
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
