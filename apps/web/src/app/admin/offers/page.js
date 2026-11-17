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
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/ui/Toast";
import {
  fromLocalDatetime,
  offerStatus,
  toLocalDatetime,
} from "@/lib/promoUtils";

const STATUS_BADGE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-slate-100 text-slate-600 border-slate-200",
  disabled: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABEL = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  disabled: "Disabled",
};

const TYPE_LABEL = {
  banner: "Banner",
  hero: "Hero",
  flash_sale: "Flash sale",
  bogo: "Buy one, get one",
  featured: "Featured",
  announcement: "Announcement",
};

const EMPTY = {
  _id: "",
  title: "",
  subtitle: "",
  description: "",
  type: "banner",
  image: "",
  link: "",
  ctaText: "",
  discountPercent: 0,
  startsAt: "",
  endsAt: "",
  order: 0,
  isActive: true,
};

export default function OffersPage() {
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
      const res = await fetch(`/api/admin/offers?${params.toString()}`);
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

  function startEdit(o) {
    setEditingId(o._id);
    setForm({
      _id: o._id,
      title: o.title || "",
      subtitle: o.subtitle || "",
      description: o.description || "",
      type: o.type || "banner",
      image: o.image || "",
      link: o.link || "",
      ctaText: o.ctaText || "",
      discountPercent: o.discountPercent || 0,
      startsAt: toLocalDatetime(o.startsAt),
      endsAt: toLocalDatetime(o.endsAt),
      order: o.order || 0,
      isActive: o.isActive !== false,
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
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        type: form.type,
        image: form.image.trim(),
        link: form.link.trim(),
        ctaText: form.ctaText.trim(),
        discountPercent: Number(form.discountPercent) || 0,
        startsAt: fromLocalDatetime(form.startsAt),
        endsAt: fromLocalDatetime(form.endsAt),
        order: Number(form.order) || 0,
        isActive: !!form.isActive,
      };

      const url = editingId
        ? `/api/admin/offers/${editingId}`
        : "/api/admin/offers";
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
      toast.success(editingId ? "Offer updated" : "Offer created");
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
      const res = await fetch(`/api/admin/offers/${pendingDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Offer deleted");
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
        title="Special Offers"
        description="Promotional banners, flash sales, and featured content."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <form
          onSubmit={save}
          className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-4 space-y-3 self-start"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            {editingId ? "Edit offer" : "New offer"}
          </h2>

          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>

          <Field label="Subtitle" htmlFor="subtitle">
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="type">
              <Select
                id="type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {Object.entries(TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Discount %" htmlFor="discountPercent" hint="Display only">
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountPercent: e.target.value }))
                }
              />
            </Field>
          </div>

          <Field label="Image">
            <ImageUploader
              max={1}
              value={form.image ? [form.image] : []}
              onChange={(imgs) => setForm((f) => ({ ...f, image: imgs[0] || "" }))}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Link / URL" htmlFor="link" hint="Where the CTA goes">
              <Input
                id="link"
                placeholder="/shop/women or https://…"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              />
            </Field>
            <Field label="CTA text" htmlFor="ctaText">
              <Input
                id="ctaText"
                placeholder="Shop now"
                value={form.ctaText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaText: e.target.value }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts at" htmlFor="startsAt">
              <Input
                id="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startsAt: e.target.value }))
                }
              />
            </Field>
            <Field label="Ends at" htmlFor="endsAt">
              <Input
                id="endsAt"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Display order" htmlFor="order" hint="Lower = first">
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              />
            </Field>
            <Field label="Status">
              <div className="pt-2">
                <Checkbox
                  label="Active"
                  checked={form.isActive}
                  onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
              </div>
            </Field>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create offer"}
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
              placeholder="Search title, description…"
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
              {Object.entries(TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.length === 0 && !loading && (
              <div className="sm:col-span-2 bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-sm">
                {search || status || type
                  ? "No offers match these filters."
                  : "No offers yet. Create one on the left."}
              </div>
            )}
            {items.map((o) => {
              const s = offerStatus(o);
              return (
                <article
                  key={o._id}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-[16/9] bg-slate-100 relative">
                    {o.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={o.image}
                        alt={o.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                    {o.discountPercent ? (
                      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-600 text-white font-medium">
                        {o.discountPercent}% OFF
                      </span>
                    ) : null}
                    <span
                      className={`absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${STATUS_BADGE[s]}`}
                    >
                      {STATUS_LABEL[s]}
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      {TYPE_LABEL[o.type] || o.type}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                      {o.title}
                    </h3>
                    {o.subtitle && (
                      <div className="text-xs text-slate-600 mt-0.5">{o.subtitle}</div>
                    )}
                    <div className="text-xs text-slate-500 mt-2">
                      {o.startsAt
                        ? new Date(o.startsAt).toLocaleDateString()
                        : "Always"}
                      {" → "}
                      {o.endsAt ? new Date(o.endsAt).toLocaleDateString() : "No end"}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(o)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setPendingDelete(o)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
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
        title="Delete offer?"
        message={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed.`
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
