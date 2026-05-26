"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button, Input, Select } from "@/components/admin/ui/Field";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmModal from "@/components/admin/ui/Confirm";
import { useToast } from "@/components/admin/ui/Toast";

export default function ProductsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sort,
      });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
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
  }, [page, search, category, status, sort, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/admin/categories?limit=100")
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${pendingDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Product deleted");
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
      <PageHeader title="Products" description="Manage your product catalog.">
        <Link href="/admin/products/new">
          <Button>+ New product</Button>
        </Link>
      </PageHeader>

      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Input
          placeholder="Search name, SKU, brand…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="-name">Name Z–A</option>
          <option value="price">Price low → high</option>
          <option value="-price">Price high → low</option>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium w-14"></th>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">Category</th>
              <th className="text-left px-3 py-2 font-medium">Price</th>
              <th className="text-left px-3 py-2 font-medium">Stock</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                  {search || category || status
                    ? "No products match these filters."
                    : "No products yet. Create your first product."}
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p._id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-10 h-10 rounded object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200" />
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{p.slug}</div>
                </td>
                <td className="px-3 py-2 text-slate-600">{p.category || "—"}</td>
                <td className="px-3 py-2 text-slate-900">
                  ${Number(p.price).toFixed(2)}
                  {p.originalPrice && p.originalPrice > p.price ? (
                    <span className="ml-1 text-xs text-slate-400 line-through">
                      ${Number(p.originalPrice).toFixed(2)}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-slate-600">{p.stock ?? 0}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                      p.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : p.status === "draft"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link href={`/admin/products/${p._id}`}>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setPendingDelete(p)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete product?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed. This cannot be undone.`
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
