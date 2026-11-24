import { Marked } from "marked";

// Normalises a parsed post payload (create or update). Mutates and returns it.
// Publishing without a date stamps "now", so the post sorts correctly.
export function preparePost(data) {
  if (typeof data.slug === "string") data.slug = data.slug.trim().toLowerCase();
  if (Array.isArray(data.tags)) {
    data.tags = [...new Set(data.tags.map((t) => t.trim()).filter(Boolean))];
  }
  if (data.status === "published" && !data.publishedAt) data.publishedAt = new Date();
  return data;
}

// Reading time at ~200 words per minute, rounded up.
export function readingMinutes(markdown) {
  const words = String(markdown || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatPostDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
}

// Markdown -> HTML for post bodies. Posts are written by admins only; raw
// HTML in the Markdown is escaped rather than rendered, and links to other
// sites open in a new tab.
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const safeHref = /^(https?:|mailto:|tel:|\/|#)/i.test(href || "") ? href.replace(/"/g, "%22") : "#";
      const external = /^https?:/i.test(safeHref);
      const t = title ? ` title="${title.replace(/"/g, "&quot;")}"` : "";
      const ext = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${safeHref}"${t}${ext}>${text}</a>`;
    },
  },
});

export function renderMarkdown(markdown) {
  return marked.parse(String(markdown || ""));
}
