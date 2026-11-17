"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Textarea,
} from "@/components/admin/ui/Field";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/ui/Toast";

const EMPTY = {
  announcementBar: { text: "", link: "", isActive: false },
  storeInfo: { name: "", tagline: "", email: "", phone: "", address: "" },
  social: { facebook: "", instagram: "", twitter: "", youtube: "", tiktok: "" },
  seo: { defaultTitle: "", defaultDescription: "", ogImage: "" },
  shipping: { freeShippingThreshold: 100, flatRate: 10, taxRate: 0.08 },
};

function Section({ title, description, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5">
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function SettingsTab() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setForm({
          announcementBar: { ...EMPTY.announcementBar, ...(data.announcementBar || {}) },
          storeInfo: { ...EMPTY.storeInfo, ...(data.storeInfo || {}) },
          social: { ...EMPTY.social, ...(data.social || {}) },
          seo: { ...EMPTY.seo, ...(data.seo || {}) },
          shipping: { ...EMPTY.shipping, ...(data.shipping || {}) },
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  function update(section, key, value) {
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        shipping: {
          freeShippingThreshold: Number(form.shipping.freeShippingThreshold) || 0,
          flatRate: Number(form.shipping.flatRate) || 0,
          taxRate: Number(form.shipping.taxRate) || 0,
        },
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
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
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-sm">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Section
        title="Announcement bar"
        description="A thin promo bar that can sit above your storefront header."
      >
        <Field label="Message">
          <Input
            value={form.announcementBar.text}
            placeholder="Free shipping on orders over $100 🎉"
            onChange={(e) => update("announcementBar", "text", e.target.value)}
          />
        </Field>
        <Field label="Link" hint="Optional URL the bar links to.">
          <Input
            value={form.announcementBar.link}
            placeholder="/shop"
            onChange={(e) => update("announcementBar", "link", e.target.value)}
          />
        </Field>
        <Checkbox
          label="Show on storefront"
          checked={form.announcementBar.isActive}
          onChange={(v) => update("announcementBar", "isActive", v)}
        />
      </Section>

      <Section title="Store info" description="Used in footers, emails, and SEO defaults.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Store name">
            <Input
              value={form.storeInfo.name}
              onChange={(e) => update("storeInfo", "name", e.target.value)}
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.storeInfo.tagline}
              placeholder="Luxury fragrances"
              onChange={(e) => update("storeInfo", "tagline", e.target.value)}
            />
          </Field>
          <Field label="Contact email">
            <Input
              type="email"
              value={form.storeInfo.email}
              onChange={(e) => update("storeInfo", "email", e.target.value)}
            />
          </Field>
          <Field label="Contact phone">
            <Input
              value={form.storeInfo.phone}
              onChange={(e) => update("storeInfo", "phone", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Address">
          <Textarea
            rows={2}
            value={form.storeInfo.address}
            onChange={(e) => update("storeInfo", "address", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Social media" description="Full URLs. Leave blank to hide.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["facebook", "instagram", "twitter", "youtube", "tiktok"].map((k) => (
            <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
              <Input
                placeholder={`https://${k}.com/…`}
                value={form.social[k]}
                onChange={(e) => update("social", k, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section
        title="Shipping & tax defaults"
        description="Used by the order math when calculating totals server-side."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Free shipping threshold ($)" hint="0 disables this perk">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.shipping.freeShippingThreshold}
              onChange={(e) =>
                update("shipping", "freeShippingThreshold", e.target.value)
              }
            />
          </Field>
          <Field label="Flat shipping ($)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.shipping.flatRate}
              onChange={(e) => update("shipping", "flatRate", e.target.value)}
            />
          </Field>
          <Field label="Tax rate" hint="0.08 = 8%">
            <Input
              type="number"
              min="0"
              max="1"
              step="0.001"
              value={form.shipping.taxRate}
              onChange={(e) => update("shipping", "taxRate", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="SEO defaults" description="Fallback metadata for pages without their own.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Default title">
            <Input
              value={form.seo.defaultTitle}
              onChange={(e) => update("seo", "defaultTitle", e.target.value)}
            />
          </Field>
          <Field label="Default description">
            <Input
              value={form.seo.defaultDescription}
              onChange={(e) => update("seo", "defaultDescription", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Open Graph image">
          <ImageUploader
            max={1}
            value={form.seo.ogImage ? [form.seo.ogImage] : []}
            onChange={(imgs) => update("seo", "ogImage", imgs[0] || "")}
          />
        </Field>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-4 pr-2 py-1.5 shadow-md">
          <span className="text-xs text-slate-500">Unsaved changes are kept locally.</span>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
