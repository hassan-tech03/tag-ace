// Shared bootstrap for the CLI scripts: loads .env.local and opens a Drizzle
// connection to Neon. Scripts are short-lived, so they use the DIRECT
// (non-pooled) URL when it's available.
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema.js";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

export function connect() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("✖ DATABASE_URL is not set. Add your Neon connection string to .env.local.");
    process.exit(1);
  }
  const pool = new pg.Pool({ connectionString: url, max: 2 });
  return { db: drizzle(pool, { schema }), pool, schema };
}
