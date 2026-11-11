import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

// One pg Pool per process, cached on globalThis so Next.js hot reloads in dev
// and warm Vercel invocations reuse it. Use Neon's *pooled* connection string
// (hostname contains "-pooler") for DATABASE_URL.
//
// The pool is created lazily so importing this module at build time (when
// DATABASE_URL may be absent) doesn't crash.
const cache = (globalThis._neonDb ??= { pool: null, db: null });

function init() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not defined. Add your Neon connection string to .env.local.");
  }
  const pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 10_000,
  });
  // Lets Vercel Fluid compute close idle clients before a function suspends.
  // No-op outside Vercel.
  try {
    attachDatabasePool(pool);
  } catch {
    /* not on Vercel */
  }
  cache.pool = pool;
  cache.db = drizzle(pool, { schema });
  return cache.db;
}

export function getDb() {
  return cache.db || init();
}

// Proxy so callers can `import { db } from "@/lib/db"` and use it directly,
// while the real connection is still created on first use.
export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const real = getDb();
      const value = real[prop];
      return typeof value === "function" ? value.bind(real) : value;
    },
  }
);

export * from "./schema";
