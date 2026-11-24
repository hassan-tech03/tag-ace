#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Restores a backup written by backup-json.mjs. REPLACES all rows in the
 * tables contained in the file, inside one transaction (all or nothing).
 * Run migrations first (`npm run db:migrate`) so the tables exist.
 *
 *   node scripts/restore-json.mjs backups/mushk-20261124-030000.json.gz --yes
 */
import fs from "node:fs";
import zlib from "node:zlib";
import { connect } from "./_db.mjs";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("Usage: restore-json.mjs <backup.json.gz> --yes");
  process.exit(1);
}
if (!process.argv.includes("--yes")) {
  console.error("This REPLACES all data in the database. Re-run with --yes to confirm.");
  process.exit(1);
}

const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString("utf8"));
const { pool } = connect();
const client = await pool.connect();

try {
  await client.query("BEGIN");
  const tables = Object.keys(data.tables);
  await client.query(`TRUNCATE ${tables.map((t) => `"${t}"`).join(", ")}`);

  for (const t of tables) {
    const { rows: cols } = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      [t]
    );
    if (!cols.length) throw new Error(`table "${t}" does not exist (run migrations first)`);
    const known = new Map(cols.map((c) => [c.column_name, c.data_type]));

    for (const row of data.tables[t]) {
      const names = Object.keys(row).filter((n) => known.has(n));
      const values = names.map((n) => {
        const v = row[n];
        return v !== null && (known.get(n) === "jsonb" || known.get(n) === "json") ? JSON.stringify(v) : v;
      });
      await client.query(
        `INSERT INTO "${t}" (${names.map((n) => `"${n}"`).join(", ")})
         VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")})`,
        values
      );
    }
    console.log(`  ${t.padEnd(14)} ${data.tables[t].length} rows`);
  }
  await client.query("COMMIT");
  console.log(`✔ Restored ${file} (taken ${data.createdAt})`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("✖ Restore failed, nothing changed:", err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
