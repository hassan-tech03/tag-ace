"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Textarea,
} from "@/components/admin/ui/Field";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmModal from "@/components/admin/ui/Confirm";
import { useToast } from "@/components/admin/ui/Toast";
import { toSlug } from "@/lib/slug";
import { STORE_CATEGORIES } from "@/lib/storefrontCategories";

const STORE_SLUGS = new Set(STORE_CATEGORIES.map((c) => c.slug));

const EMPTY = {
  _id: "",
  name: "",
  slug: "",
  description: "",
  image: "",
  order: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
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
      const res = await fetch(`/api/admin/categories?${params.toString()}`);
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
  }, [page, search, toast]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(c) {
    setEditingId(c._id);
    setForm({
      _id: c._id,
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      image: c.image || "",
      order: c.order || 0,
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
        name: form.name.trim(),
        slug: (form.slug || toSlug(form.name)).trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        order: Number(form.order) || 0,
        isActive: !!form.isActive,
      };
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
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
      toast.success(editingId ? "Category updated" : "Category created");
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
      const res = await fetch(`/api/admin/categories/${pendingDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Category deleted");
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
        title="Categories"
        description="The storefront ships with three built-in categories: men, women, unisex. They mirror the /shop/men, /shop/women and /shop/unisex pages. Add more here only if you also plan to add a matching shop page."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <form
          onSubmit={save}
          className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-4 space-y-3 self-start"
        >
          <h2 className="text-sm font-semibold text-slate-900">
            {editingId ? "Edit category" : "New category"}
          </h2>

          <Field label="Name" htmlFor="name" required>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: editingId ? f.slug : toSlug(name),
                }));
              }}
            />
          </Field>

          <Field label="Slug" htmlFor="slug" required hint="Lowercase, dashes only.">
            <Input
              id="slug"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>

          <Field label="Image URL" htmlFor="image">
            <Input
              id="image"
              type="url"
              placeholder="https://…"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            />
          </Field>

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
              {saving ? "Saving…" : editingId ? "Save changes" : "Create category"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search categories…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Slug</th>
                  <th className="text-left px-3 py-2 font-medium">Order</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                      No categories yet. Create your first one on the left.
                    </td>
                  </tr>
                )}
                {items.map((c) => {
                  const isStore = STORE_SLUGS.has(c.slug);
                  return (
                    <tr key={c._id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-900">
                        <div className="flex items-center gap-2">
                          {c.name}
                          {isStore && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Storefront
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-500 font-mono text-xs">{c.slug}</td>
                      <td className="px-3 py-2 text-slate-500">{c.order ?? 0}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            c.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {c.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => startEdit(c)}>
                            Edit
                          </Button>
                          {!isStore && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setPendingDelete(c)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
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
        title="Delete category?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed. Products in this category will keep their assignment but the category page will 404.`
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
