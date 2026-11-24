"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/admin/ui/PageHeader";
import { Button, Input, Select } from "@/components/admin/ui/Field";
import Pagination from "@/components/admin/ui/Pagination";
import ConfirmModal from "@/components/admin/ui/Confirm";
import { useToast } from "@/components/admin/ui/Toast";
import { formatPostDate } from "@/lib/blog";

export default function BlogAdminPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-publishedAt");
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", sort });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/posts?${params}`);
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
  }, [page, search, status, sort, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${pendingDelete._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Post deleted");
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
      <PageHeader title="Blog" description="Write and publish articles for the /blog page.">
        <Link href="/admin/blog/new">
          <Button>+ New post</Button>
        </Link>
      </PageHeader>

      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input
          placeholder="Search title or excerpt…"
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
          <option value="">All posts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-publishedAt">Newest published</option>
          <option value="-updatedAt">Recently edited</option>
          <option value="title">Title A–Z</option>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium w-20"></th>
                <th className="text-left px-3 py-2 font-medium">Title</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                <th className="text-left px-3 py-2 font-medium">Published</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                    {search || status ? "No posts match these filters." : "No posts yet. Write your first article."}
                  </td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt="" className="w-14 h-10 rounded object-cover border border-slate-200" />
                    ) : (
                      <div className="w-14 h-10 rounded bg-slate-100 border border-slate-200" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-slate-900 font-medium">{p.title}</div>
                    <div className="text-xs text-slate-500 font-mono">/blog/{p.slug}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                        p.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{formatPostDate(p.publishedAt) || "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      {p.status === "published" && (
                        <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost">View</Button>
                        </a>
                      )}
                      <Link href={`/admin/blog/${p._id}`}>
                        <Button size="sm" variant="secondary">Edit</Button>
                      </Link>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setPendingDelete(p)}>
                        Delete
                      </Button>
                    </div>
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

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete post?"
        message={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ""}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setPendingDelete(null)}
      />
    </div>
  );
}
