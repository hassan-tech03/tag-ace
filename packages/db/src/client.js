import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

// One pg Pool per process, cached on globalThis so Next.js hot reloads in dev
// reuse it instead of opening a new pool on every edit.
//
// The pool is created lazily so importing this module at build time (when
// DATABASE_URL is absent, e.g. inside `docker build`) doesn't crash.
const cache = (globalThis.__mushkDb ??= { pool: null, db: null });

function init() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not defined. Set it in apps/web/.env.local (dev) or the server .env (production)."
    );
  }
  const pool = new pg.Pool({
    connectionString: url,
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (err) => {
    // An idle client died (e.g. Postgres restarted). pg drops it from the
    // pool; log it instead of letting it crash the process.
    console.error("[db] idle client error:", err.message);
  });
  cache.pool = pool;
  cache.db = drizzle(pool, { schema });
  return cache.db;
}

export function getDb() {
  return cache.db || init();
}

export async function closeDb() {
  if (cache.pool) await cache.pool.end();
  cache.pool = null;
  cache.db = null;
}

// Proxy so callers can `import { db } from "@mushk/db"` and use it directly,
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
