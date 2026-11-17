import { and, asc, desc, ilike, or, sql } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

// The admin UI was written against Mongo documents and reads `_id`. We keep
// emitting it (alongside `id`) so the frontend didn't need to change.
export function serialize(row) {
  if (!row) return row;
  return { _id: row.id, ...row };
}

export function serializeOrder(row) {
  if (!row) return row;
  const { customerEmail, ...rest } = row;
  return {
    _id: row.id,
    ...rest,
    customer: { ...(row.customer || {}), email: customerEmail },
  };
}

// Escape LIKE wildcards in user input so "50%" matches literally.
function likePattern(search) {
  return `%${String(search).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

// Case-insensitive "contains" across several columns / SQL expressions.
export function searchAny(search, columns) {
  if (!search) return undefined;
  const pattern = likePattern(search);
  return or(...columns.map((c) => ilike(c, pattern)));
}

// Translates the Mongo-style sort strings the UI sends ("-createdAt",
// "order name", "order -createdAt") into ORDER BY clauses. Only fields in
// `columns` are honoured; anything else falls back to `fallback`.
export function buildOrderBy(sortStr, columns, fallback) {
  const clauses = [];
  for (const part of String(sortStr || "").split(/[\s,]+/).filter(Boolean)) {
    const dir = part.startsWith("-") ? desc : asc;
    const col = columns[part.replace(/^[-+]/, "")];
    if (col) clauses.push(dir(col));
  }
  if (clauses.length === 0) return fallback ? buildOrderBy(fallback, columns) : [];
  return clauses;
}

export function where(...conds) {
  const list = conds.filter(Boolean);
  if (list.length === 0) return undefined;
  return list.length === 1 ? list[0] : and(...list);
}

export function pageResult(items, total, page, limit) {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const countAll = sql`count(*)::int`;
