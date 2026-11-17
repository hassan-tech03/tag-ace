// Shared bootstrap for the CLI scripts: loads env (when not already set) and
// opens a short-lived Drizzle connection.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/schema.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILES = [
  path.resolve(here, "../.env"),
  path.resolve(here, "../../../apps/web/.env.local"),
];

// Loaded on import, so scripts can read ADMIN_* etc. at top level. Values
// already in the environment (e.g. from docker compose) are never overridden.
for (const file of ENV_FILES) {
  if (fs.existsSync(file)) process.loadEnvFile(file);
}

export function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✖ DATABASE_URL is not set (env, packages/db/.env or apps/web/.env.local).");
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: url, max: 2 });
  return { db: drizzle(pool, { schema }), pool, schema };
}
