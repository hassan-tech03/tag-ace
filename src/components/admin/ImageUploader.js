"use client";

import { useRef, useState } from "react";
import { Button, Input } from "./ui/Field";
import { useToast } from "./ui/Toast";

// Compact uploader: shows a row of image thumbs with remove buttons, plus
// either an "Upload" button (if Cloudinary is configured server-side) or a
// "Paste URL" input fallback. The parent owns the array of URLs in `value`.
export default function ImageUploader({ value = [], onChange, max = 6 }) {
  const toast = useToast();
  const fileInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");

  function update(next) {
    onChange?.(next);
  }

  function removeAt(idx) {
    update(value.filter((_, i) => i !== idx));
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (value.length + files.length > max) {
      toast.error(`You can attach at most ${max} images.`);
      return;
    }

    setBusy(true);
    try {
      const next = [...value];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || "Upload failed");
          break;
        }
        next.push(data.url);
      }
      update(next);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function addUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    if (value.length >= max) {
      toast.error(`You can attach at most ${max} images.`);
      return;
    }
    update([...value, trimmed]);
    setUrl("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="relative w-20 h-20 rounded-md overflow-hidden border border-slate-200 bg-slate-50"
          >
            {/* Plain <img> to skip Next/Image domain config requirements for arbitrary URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/90 text-slate-700 hover:bg-white text-xs"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="w-20 h-20 rounded-md border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 flex flex-col items-center justify-center text-xs disabled:opacity-60"
          >
            {busy ? "Uploading…" : "+ Upload"}
          </button>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="…or paste an image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={addUrl} disabled={!url.trim()}>
          Add URL
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Upload requires Cloudinary env vars. Otherwise paste any public image URL. Max {max} images,
        5MB each.
      </p>
    </div>
  );
}
