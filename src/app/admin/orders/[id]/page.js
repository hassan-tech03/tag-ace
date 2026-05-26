"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/ui/PageHeader";
import {
  Button,
  Field,
  Select,
  Textarea,
} from "@/components/admin/ui/Field";
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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cod_pending", label: "COD pending" },
  { value: "cod_collected", label: "COD collected" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setOrder(data);
      setStatus(data.status);
      setPaymentStatus(data.paymentStatus);
      setAdminNotes(data.adminNotes || "");
    } catch (err) {
      toast.error(err.message);
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      const payload = {};
      if (status !== order.status) payload.status = status;
      if (paymentStatus !== order.paymentStatus) payload.paymentStatus = paymentStatus;
      if ((adminNotes || "") !== (order.adminNotes || "")) payload.adminNotes = adminNotes;

      if (Object.keys(payload).length === 0) {
        toast.info("Nothing changed.");
        return;
      }

      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.issues?.length) {
          toast.error(`${data.issues[0].path}: ${data.issues[0].message}`);
        } else {
          toast.error(data.error || "Save failed");
        }
        return;
      }
      toast.success("Order updated");
      setOrder(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-slate-500">Loading…</div>
    );
  }
  if (!order) return null;

  const customerName =
    [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatDate(order.createdAt)}`}
      >
        <Link href="/admin/orders">
          <Button variant="secondary">← Back to orders</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Items">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="font-medium pb-2">Product</th>
                  <th className="font-medium pb-2 text-right">Price</th>
                  <th className="font-medium pb-2 text-right">Qty</th>
                  <th className="font-medium pb-2 text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((it, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {it.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={it.image}
                            alt=""
                            className="w-10 h-10 rounded object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200" />
                        )}
                        <div>
                          <div className="text-slate-900">{it.name}</div>
                          {it.sku && <div className="text-xs text-slate-500">SKU: {it.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-right text-slate-700">{formatMoney(it.price)}</td>
                    <td className="py-2 text-right text-slate-700">{it.quantity}</td>
                    <td className="py-2 text-right text-slate-900">
                      {formatMoney(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-sm">
                <tr>
                  <td colSpan={3} className="pt-3 text-right text-slate-500">
                    Subtotal
                  </td>
                  <td className="pt-3 text-right text-slate-700">{formatMoney(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right text-slate-500">
                    Shipping
                  </td>
                  <td className="text-right text-slate-700">{formatMoney(order.shipping)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right text-slate-500">
                    Tax
                  </td>
                  <td className="text-right text-slate-700">{formatMoney(order.tax)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-medium text-slate-900">
                    Total
                  </td>
                  <td className="pt-2 text-right font-semibold text-slate-900">
                    {formatMoney(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
            </div>
          </Card>

          {order.customerNotes && (
            <Card title="Customer notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.customerNotes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Status">
            <Field label="Fulfillment status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Payment status">
              <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Admin notes" hint="Visible only inside the admin.">
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this order…"
              />
            </Field>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Card>

          <Card title="Customer">
            <KV label="Name" value={customerName} />
            <KV label="Email" value={order.customer?.email} />
            <KV label="Phone" value={order.customer?.phone || "—"} />
          </Card>

          <Card title="Shipping address">
            <Address a={order.shippingAddress} />
          </Card>

          {order.billingAddress && Object.values(order.billingAddress || {}).some(Boolean) && (
            <Card title="Billing address">
              <Address a={order.billingAddress} />
            </Card>
          )}

          <Card title="Payment">
            <KV label="Method" value={order.paymentMethod === "stripe" ? "Stripe Checkout" : "Cash on Delivery"} />
            {order.stripeSessionId && (
              <KV label="Stripe session" value={<code className="text-xs">{order.stripeSessionId}</code>} />
            )}
            {order.stripePaymentIntentId && (
              <KV label="Payment intent" value={<code className="text-xs">{order.stripePaymentIntentId}</code>} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 text-right break-all">{value}</span>
    </div>
  );
}

function Address({ a }) {
  if (!a) return <p className="text-sm text-slate-500">—</p>;
  const lines = [
    a.line1,
    a.line2,
    [a.city, a.state, a.zipCode].filter(Boolean).join(", "),
    a.country,
  ].filter(Boolean);
  if (lines.length === 0) return <p className="text-sm text-slate-500">—</p>;
  return (
    <div className="text-sm text-slate-700">
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
}
