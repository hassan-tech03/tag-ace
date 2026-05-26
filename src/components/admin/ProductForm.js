"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import ImageUploader from "@/components/admin/ImageUploader";
import { toSlug } from "@/lib/slug";
import { FRAGRANCE_FAMILIES as SHARED_FAMILIES } from "@/lib/storefrontCategories";

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: "",
  originalPrice: "",
  category: "",
  fragranceFamily: "",
  size: "",
  brand: "",
  sku: "",
  images: [],
  stock: 0,
  isHotDeal: false,
  isNewArrival: false,
  rating: 0,
  reviewCount: 0,
  discount: 0,
  notes: { top: [], middle: [], base: [] },
  badge: "",
  status: "draft",
};

const FRAGRANCE_FAMILIES = SHARED_FAMILIES;

function csvToArray(s) {
  return String(s || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function arrayToCsv(a) {
  return Array.isArray(a) ? a.join(", ") : "";
}

export default function ProductForm({ initial, productId }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!productId;

  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }));
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories?limit=100")
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
  }, []);

  // CSV mirrors for note fields so users can type "Rose, Bergamot" naturally.
  const notesCsv = useMemo(
    () => ({
      top: arrayToCsv(form.notes?.top),
      middle: arrayToCsv(form.notes?.middle),
      base: arrayToCsv(form.notes?.base),
    }),
    [form.notes]
  );

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setNotes(layer, csv) {
    setForm((f) => ({
      ...f,
      notes: { ...f.notes, [layer]: csvToArray(csv) },
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: (form.slug || toSlug(form.name)).trim().toLowerCase(),
        price: Number(form.price),
        originalPrice:
          form.originalPrice === "" || form.originalPrice == null
            ? null
            : Number(form.originalPrice),
        stock: Number(form.stock) || 0,
        rating: Number(form.rating) || 0,
        reviewCount: Number(form.reviewCount) || 0,
        discount: Number(form.discount) || 0,
        category: (form.category || "").toLowerCase(),
      };

      const url = isEdit ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
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
      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Basic information">
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
                  slug: isEdit ? f.slug : toSlug(name),
                }));
              }}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Slug" htmlFor="slug" required hint="Lowercase, dashes only.">
              <Input
                id="slug"
                required
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
            </Field>
            <Field label="SKU" htmlFor="sku">
              <Input id="sku" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
            </Field>
          </div>

          <Field label="Short description" htmlFor="shortDescription" hint="Shown on product cards.">
            <Input
              id="shortDescription"
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
        </Card>

        <Card title="Images">
          <ImageUploader
            value={form.images}
            onChange={(images) => set("images", images)}
          />
        </Card>

        <Card title="Fragrance notes" subtitle="Comma-separated. Used on the product detail page.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Top notes">
              <Input
                value={notesCsv.top}
                onChange={(e) => setNotes("top", e.target.value)}
                placeholder="Rose, Bergamot"
              />
            </Field>
            <Field label="Middle notes">
              <Input
                value={notesCsv.middle}
                onChange={(e) => setNotes("middle", e.target.value)}
                placeholder="Jasmine, Peony"
              />
            </Field>
            <Field label="Base notes">
              <Input
                value={notesCsv.base}
                onChange={(e) => setNotes("base", e.target.value)}
                placeholder="Musk, Vanilla"
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-5">
        <Card title="Status">
          <Field label="Visibility" htmlFor="status">
            <Select id="status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft (hidden)</option>
              <option value="active">Active (visible)</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Badge" htmlFor="badge" hint="e.g. New, Sale, Limited">
            <Input
              id="badge"
              value={form.badge}
              onChange={(e) => set("badge", e.target.value)}
            />
          </Field>
          <div className="flex flex-col gap-2">
            <Checkbox
              label="Hot deal"
              checked={form.isHotDeal}
              onChange={(v) => set("isHotDeal", v)}
            />
            <Checkbox
              label="New arrival"
              checked={form.isNewArrival}
              onChange={(v) => set("isNewArrival", v)}
            />
          </div>
        </Card>

        <Card title="Pricing & stock">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" htmlFor="price" required>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </Field>
            <Field label="Compare-at price" htmlFor="originalPrice" hint="Optional. Shows strikethrough.">
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.originalPrice ?? ""}
                onChange={(e) => set("originalPrice", e.target.value)}
              />
            </Field>
            <Field label="Stock" htmlFor="stock">
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
            </Field>
            <Field label="Discount %" htmlFor="discount">
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) => set("discount", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card title="Organization">
          <Field label="Category" htmlFor="category">
            <Select
              id="category"
              value={form.category || ""}
              onChange={(e) => set("category", e.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Brand" htmlFor="brand">
            <Input id="brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Size" htmlFor="size" hint="e.g. 50ml">
              <Input id="size" value={form.size} onChange={(e) => set("size", e.target.value)} />
            </Field>
            <Field label="Fragrance family" htmlFor="fragranceFamily">
              <Select
                id="fragranceFamily"
                value={form.fragranceFamily}
                onChange={(e) => set("fragranceFamily", e.target.value)}
              >
                <option value="">—</option>
                {FRAGRANCE_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Reviews (manual)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating" htmlFor="rating" hint="0–5">
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
              />
            </Field>
            <Field label="Review count" htmlFor="reviewCount">
              <Input
                id="reviewCount"
                type="number"
                min="0"
                value={form.reviewCount}
                onChange={(e) => set("reviewCount", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-center gap-2 sticky bottom-0 bg-white/80 backdrop-blur p-3 rounded-lg border border-slate-200">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </form>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
