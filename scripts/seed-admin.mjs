#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seeds the first admin user.
 *
 * Reads DATABASE_URL, ADMIN_EMAIL, and ADMIN_PASSWORD from .env.local (or the
 * environment). Run with: `npm run seed:admin`.
 *
 * Safe to re-run: if the email already exists, the password and name are
 * updated instead of creating a duplicate.
 */
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { connect } from "./_db.mjs";

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("✖ ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  console.error("  Add them to .env.local, e.g.");
  console.error("    ADMIN_EMAIL=you@example.com");
  console.error("    ADMIN_PASSWORD=a-strong-password");
  process.exit(1);
}

const { db, pool, schema } = connect();
const { adminUsers } = schema;

async function main() {
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const [row] = await db
    .insert(adminUsers)
    .values({ email, passwordHash, name: ADMIN_NAME || "", role: "superadmin" })
    .onConflictDoUpdate({
      target: adminUsers.email,
      set: {
        passwordHash,
        ...(ADMIN_NAME ? { name: ADMIN_NAME } : {}),
        updatedAt: new Date(),
      },
    })
    .returning({ inserted: sql`(xmax = 0)` });

  console.log(row.inserted ? `✔ Created admin: ${email}` : `✔ Updated existing admin: ${email}`);
  console.log("Done. You can now sign in at /admin/login");
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
