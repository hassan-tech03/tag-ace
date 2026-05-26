#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seeds the first admin user.
 *
 * Reads MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD from .env.local (or the
 * environment). Run with: `npm run seed:admin`.
 *
 * Safe to re-run: if the email already exists, the password and name are
 * updated instead of creating a duplicate.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

if (!MONGODB_URI) {
  console.error("✖ MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("✖ ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  console.error("  Add them to .env.local, e.g.");
  console.error("    ADMIN_EMAIL=you@example.com");
  console.error("    ADMIN_PASSWORD=a-strong-password");
  process.exit(1);
}

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const AdminUser =
  mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

async function main() {
  console.log("→ Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    if (ADMIN_NAME) existing.name = ADMIN_NAME;
    existing.role = existing.role || "superadmin";
    await existing.save();
    console.log(`✔ Updated existing admin: ${email}`);
  } else {
    await AdminUser.create({
      email,
      passwordHash,
      name: ADMIN_NAME || "",
      role: "superadmin",
    });
    console.log(`✔ Created admin: ${email}`);
  }

  await mongoose.disconnect();
  console.log("Done. You can now sign in at /admin/login");
}

main().catch((err) => {
  console.error("✖ Seed failed:", err);
  process.exit(1);
});
