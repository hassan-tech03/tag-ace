"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import ImageUploader from "@/components/admin/ImageUploader";
import { toSlug } from "@/lib/slug";
import { renderMarkdown, readingMinutes } from "@/lib/blog";

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "Mushk Perfumes",
  tags: [],
  status: "draft",
  publishedAt: null,
};

function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Card({ title, children, aside }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
      {(title || aside) && (
        <div className="flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export default function PostForm({ initial, postId }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!postId;

  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }));
  const [tagsText, setTagsText] = useState(() => (initial?.tags || []).join(", "));
  const [tab, setTab] = useState("write");
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const previewHtml = useMemo(() => (tab === "preview" ? renderMarkdown(form.content) : ""), [tab, form.content]);
  const minutes = readingMinutes(form.content);

  async function save(statusOverride) {
    setSaving(true);
    try {
      const status = statusOverride || form.status;
      const payload = {
        title: form.title.trim(),
        slug: (form.slug || toSlug(form.title)).trim().toLowerCase(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage: form.coverImage || "",
        author: form.author.trim() || "Mushk Perfumes",
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
        status,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      };
      const res = await fetch(isEdit ? `/api/admin/posts/${postId}` : "/api/admin/posts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.issues?.length ? `${data.issues[0].path}: ${data.issues[0].message}` : data.error || "Save failed");
        return;
      }
      toast.success(status === "published" ? "Post published" : "Draft saved");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    save();
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Post">
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title, slug: isEdit ? f.slug : toSlug(title) }));
              }}
            />
          </Field>
          <Field label="URL slug" htmlFor="slug" required hint={`mushkscents.com/blog/${form.slug || "your-post"}`}>
            <Input id="slug" required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Excerpt" htmlFor="excerpt" hint="One or two sentences shown on the blog page and in search results.">
            <Textarea id="excerpt" rows={3} maxLength={500} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </Field>
        </Card>

        <Card
          title="Content"
          aside={
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
              {["write", "preview"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-md capitalize ${tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-600"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        >
          {tab === "write" ? (
            <Field hint={`Markdown: ## Heading, **bold**, - list, [link](/shop). About ${minutes} min read.`}>
              <Textarea
                rows={22}
                className="font-mono text-[13px] leading-relaxed"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder={"Write your post…\n\n## A heading\n\nA paragraph with **bold** text and a [link](/shop)."}
              />
            </Field>
          ) : (
            <div
              className="blog-prose blog-prose--admin min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: previewHtml || "<p><em>Nothing to preview yet.</em></p>" }}
            />
          )}
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Publish">
          <Field label="Status" htmlFor="status">
            <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </Select>
          </Field>
          <Field label="Publish date" htmlFor="publishedAt" hint="Leave empty to use the moment you publish.">
            <Input
              id="publishedAt"
              type="datetime-local"
              value={toLocalInput(form.publishedAt)}
              onChange={(e) => set("publishedAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
            />
          </Field>
          <div className="flex flex-col gap-2 pt-1">
            <Button type="button" disabled={saving} onClick={() => save("published")}>
              {saving ? "Saving…" : form.status === "published" && isEdit ? "Update post" : "Publish"}
            </Button>
            <Button type="button" variant="secondary" disabled={saving} onClick={() => save("draft")}>
              Save as draft
            </Button>
            {isEdit && form.status === "published" && (
              <a
                href={`/blog/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-xs text-amber-700 hover:underline mt-1"
              >
                View post ↗
              </a>
            )}
          </div>
        </Card>

        <Card title="Cover image">
          <ImageUploader
            value={form.coverImage ? [form.coverImage] : []}
            onChange={(urls) => set("coverImage", urls[urls.length - 1] || "")}
            max={1}
          />
        </Card>

        <Card title="Details">
          <Field label="Author" htmlFor="author">
            <Input id="author" value={form.author} onChange={(e) => set("author", e.target.value)} />
          </Field>
          <Field label="Tags" htmlFor="tags" hint="Comma separated, e.g. Guides, Oud">
            <Input id="tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
          </Field>
        </Card>
      </div>
    </form>
  );
}
