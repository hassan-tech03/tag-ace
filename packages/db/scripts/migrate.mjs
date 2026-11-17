#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Applies pending SQL migrations from ./migrations.
 *
 * Uses drizzle-orm's runtime migrator (no drizzle-kit needed), so it runs in
 * the production `tools` container on every deploy. Already-applied
 * migrations are tracked in drizzle.__drizzle_migrations and skipped.
 *
 * Run with: `npm run db:migrate`
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { connect } from "./_db.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const { db, pool } = connect();

// Postgres may still be starting when the container comes up.
async function waitForDb(tries = 30) {
  for (let i = 1; i <= tries; i++) {
    try {
      await pool.query("select 1");
      return;
    } catch (err) {
      if (i === tries) throw err;
      console.log(`… waiting for database (${err.code || err.message})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

try {
  await waitForDb();
  await migrate(db, { migrationsFolder: path.resolve(here, "../migrations") });
  console.log("✔ Migrations up to date.");
} catch (err) {
  console.error("✖ Migration failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
