#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Data backup without pg_dump: writes every row of every table in the
 * `public` schema to a gzipped JSON file. The schema itself comes from the
 * migrations, so migrations + this file = full restore (restore-json.mjs).
 *
 * Useful where the installed pg_dump is older than the server (pg_dump
 * refuses to dump newer servers).
 *
 *   node scripts/backup-json.mjs [output-dir]      (default: ./backups)
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { connect } from "./_db.mjs";

const outDir = path.resolve(process.argv[2] || process.env.BACKUP_DIR || "backups");
const { pool } = connect();

try {
  const { rows: tables } = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
  );
  const data = { createdAt: new Date().toISOString(), tables: {} };
  for (const { table_name: t } of tables) {
    const { rows } = await pool.query(`SELECT * FROM "${t}"`);
    data.tables[t] = rows;
  }
  const { rows: mig } = await pool
    .query(`SELECT max(created_at)::text AS last FROM drizzle.__drizzle_migrations`)
    .catch(() => ({ rows: [{ last: null }] }));
  data.lastMigration = mig[0]?.last ?? null;

  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const file = path.join(outDir, `mushk-${stamp}.json.gz`);
  fs.writeFileSync(`${file}.partial`, zlib.gzipSync(JSON.stringify(data)));
  fs.renameSync(`${file}.partial`, file);

  const counts = Object.entries(data.tables).map(([t, r]) => `${t}=${r.length}`).join(" ");
  console.log(`✔ ${new Date().toISOString()} backup: ${file} (${fs.statSync(file).size} bytes) ${counts}`);
} catch (err) {
  console.error("✖ Backup failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
