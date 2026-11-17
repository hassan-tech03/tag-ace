"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/admin/ui/Field";
import ConfirmModal from "@/components/admin/ui/Confirm";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/ui/Toast";

const EMPTY = {
  _id: "",
  name: "",
  location: "",
  rating: 5,
  body: "",
  image: "",
  order: 0,
  isActive: true,
};

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="inline-flex items-center text-amber-500 text-sm">
      {"★".repeat(v)}
      <span className="text-slate-300">{"★".repeat(5 - v)}</span>
    </span>
  );
}

export default function TestimonialsTab() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/testimonials?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setItems(data.items);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(t) {
    setEditingId(t._id);
    setForm({
      _id: t._id,
      name: t.name || "",
      location: t.location || "",
      rating: t.rating ?? 5,
      body: t.body || "",
      image: t.image || "",
      order: t.order || 0,
      isActive: t.isActive !== false,
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
        name: form.name.trim(),
        location: form.location.trim(),
        rating: Number(form.rating) || 5,
        body: form.body.trim(),
        image: form.image.trim(),
        order: Number(form.order) || 0,
        isActive: !!form.isActive,
      };
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : "/api/admin/testimonials";
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
      toast.success(editingId ? "Testimonial updated" : "Testimonial added");
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
      const res = await fetch(`/api/admin/testimonials/${pendingDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Testimonial deleted");
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <form
        onSubmit={save}
        className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-4 space-y-3 self-start"
      >
        <h3 className="text-sm font-semibold text-slate-900">
          {editingId ? "Edit testimonial" : "New testimonial"}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" htmlFor="t-name" required>
            <Input
              id="t-name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Location" htmlFor="t-location">
            <Input
              id="t-location"
              placeholder="City, Country"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </Field>
        </div>

        <Field label="Rating" htmlFor="t-rating">
          <Select
            id="t-rating"
            value={form.rating}
            onChange={(e) =>
              setForm((f) => ({ ...f, rating: Number(e.target.value) }))
            }
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Quote" htmlFor="t-body" required>
          <Textarea
            id="t-body"
            rows={4}
            required
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
        </Field>

        <Field label="Avatar">
          <ImageUploader
            max={1}
            value={form.image ? [form.image] : []}
            onChange={(imgs) => setForm((f) => ({ ...f, image: imgs[0] || "" }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Display order" htmlFor="t-order" hint="Lower = first">
            <Input
              id="t-order"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm((f) => ({ ...f, order: e.target.value }))
              }
            />
          </Field>
          <Field label="Visibility">
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
            {saving ? "Saving…" : editingId ? "Save changes" : "Add testimonial"}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            placeholder="Search name, location, body…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.length === 0 && !loading && (
            <div className="sm:col-span-2 bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-sm">
              No testimonials yet. Add one on the left.
            </div>
          )}
          {items.map((t) => (
            <article
              key={t._id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                  {t.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                      {t.name?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-slate-900 truncate">{t.name}</div>
                    <Stars value={t.rating} />
                  </div>
                  {t.location && (
                    <div className="text-xs text-slate-500">{t.location}</div>
                  )}
                </div>
              </div>
              <blockquote className="mt-3 text-sm text-slate-700 line-clamp-4">
                “{t.body}”
              </blockquote>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border ${
                    t.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {t.isActive ? "Active" : "Hidden"}
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(t)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setPendingDelete(t)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete testimonial?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}"'s testimonial will be permanently removed.`
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
