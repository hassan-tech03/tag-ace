"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/admin/ui/Field";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmModal from "@/components/admin/ui/Confirm";
import { useToast } from "@/components/admin/ui/Toast";
import {
  couponStatus,
  fromLocalDatetime,
  generateCouponCode,
  toLocalDatetime,
} from "@/lib/promoUtils";

const STATUS_BADGE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-slate-100 text-slate-600 border-slate-200",
  used_up: "bg-slate-100 text-slate-600 border-slate-200",
  disabled: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABEL = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  used_up: "Used up",
  disabled: "Disabled",
};

const EMPTY = {
  _id: "",
  code: "",
  description: "",
  type: "percent",
  value: 10,
  minPurchase: 0,
  maxDiscount: "",
  validFrom: "",
  validUntil: "",
  usageLimit: "",
  perCustomerLimit: "",
  isActive: true,
};

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function describeDiscount(c) {
  if (c.type === "percent") return `${c.value || 0}% off`;
  if (c.type === "fixed") return `${formatMoney(c.value)} off`;
  if (c.type === "free_shipping") return "Free shipping";
  return "—";
}

export default function CouponsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type, toast]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(c) {
    setEditingId(c._id);
    setForm({
      _id: c._id,
      code: c.code || "",
      description: c.description || "",
      type: c.type || "percent",
      value: c.value ?? 0,
      minPurchase: c.minPurchase ?? 0,
      maxDiscount: c.maxDiscount == null ? "" : c.maxDiscount,
      validFrom: toLocalDatetime(c.validFrom),
      validUntil: toLocalDatetime(c.validUntil),
      usageLimit: c.usageLimit == null ? "" : c.usageLimit,
      perCustomerLimit: c.perCustomerLimit == null ? "" : c.perCustomerLimit,
      isActive: c.isActive !== false,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        type: form.type,
        value: Number(form.value) || 0,
        minPurchase: Number(form.minPurchase) || 0,
        maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
        validFrom: fromLocalDatetime(form.validFrom),
        validUntil: fromLocalDatetime(form.validUntil),
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
        perCustomerLimit:
          form.perCustomerLimit === "" ? null : Number(form.perCustomerLimit),
        isActive: !!form.isActive,
      };

      const url = editingId
        ? `/api/admin/coupons/${editingId}`
        : "/api/admin/coupons";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
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
      toast.success(editingId ? "Coupon updated" : "Coupon created");
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${pendingDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Coupon deleted");
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Discount codes the storefront checkout can validate."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <form
          onSubmit={save}
          className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-4 space-y-3 self-start"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            {editingId ? "Edit coupon" : "New coupon"}
          </h2>

          <Field label="Code" htmlFor="code" required hint="Customer-facing code.">
            <div className="flex gap-2">
              <Input
                id="code"
                required
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setForm((f) => ({ ...f, code: generateCouponCode() }))}
              >
                Generate
              </Button>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="type">
              <Select
                id="type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_shipping">Free shipping</option>
              </Select>
            </Field>
            <Field
              label={
                form.type === "percent"
                  ? "Percent"
                  : form.type === "fixed"
                  ? "Amount ($)"
                  : "Value"
              }
              htmlFor="value"
            >
              <Input
                id="value"
                type="number"
                step={form.type === "percent" ? "1" : "0.01"}
                min="0"
                max={form.type === "percent" ? "100" : undefined}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                disabled={form.type === "free_shipping"}
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="description" hint="Internal note.">
            <Textarea
              id="description"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Min purchase ($)" htmlFor="minPurchase">
              <Input
                id="minPurchase"
                type="number"
                step="0.01"
                min="0"
                value={form.minPurchase}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minPurchase: e.target.value }))
                }
              />
            </Field>
            <Field label="Max discount ($)" htmlFor="maxDiscount" hint="Cap for %">
              <Input
                id="maxDiscount"
                type="number"
                step="0.01"
                min="0"
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxDiscount: e.target.value }))
                }
                disabled={form.type !== "percent"}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valid from" htmlFor="validFrom">
              <Input
                id="validFrom"
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, validFrom: e.target.value }))
                }
              />
            </Field>
            <Field label="Valid until" htmlFor="validUntil">
              <Input
                id="validUntil"
                type="datetime-local"
                value={form.validUntil}
                onChange={(e) =>
                  setForm((f) => ({ ...f, validUntil: e.target.value }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Total uses" htmlFor="usageLimit" hint="Blank = unlimited">
              <Input
                id="usageLimit"
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, usageLimit: e.target.value }))
                }
              />
            </Field>
            <Field
              label="Per customer"
              htmlFor="perCustomerLimit"
              hint="Blank = no limit"
            >
              <Input
                id="perCustomerLimit"
                type="number"
                min="0"
                value={form.perCustomerLimit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, perCustomerLimit: e.target.value }))
                }
              />
            </Field>
          </div>

          <div className="pt-1">
            <Checkbox
              label="Active"
              checked={form.isActive}
              onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create coupon"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Search code or description…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <Select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </Select>
            <Select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
            >
              <option value="">All types</option>
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount</option>
              <option value="free_shipping">Free shipping</option>
            </Select>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Code</th>
                  <th className="text-left px-3 py-2 font-medium">Discount</th>
                  <th className="text-left px-3 py-2 font-medium">Uses</th>
                  <th className="text-left px-3 py-2 font-medium">Valid until</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                      {search || status || type
                        ? "No coupons match these filters."
                        : "No coupons yet. Create one on the left."}
                    </td>
                  </tr>
                )}
                {items.map((c) => {
                  const s = couponStatus(c);
                  return (
                    <tr key={c._id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <div className="font-mono text-slate-900">{c.code}</div>
                        {c.description && (
                          <div className="text-xs text-slate-500 truncate max-w-[18ch]">
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{describeDiscount(c)}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {c.usedCount || 0}
                        {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {c.validUntil
                          ? new Date(c.validUntil).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGE[s]}`}
                        >
                          {STATUS_LABEL[s]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setPendingDelete(c)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onChange={setPage}
          />
        </div>
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete coupon?"
        message={
          pendingDelete
            ? `"${pendingDelete.code}" will be permanently removed. Existing orders that used this code are unaffected.`
            : ""
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setPendingDelete(null)}
      />
    </div>
  );
}
