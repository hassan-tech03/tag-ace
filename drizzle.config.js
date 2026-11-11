import fs from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read .env.local on its own.
if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");

// Migrations must use Neon's DIRECT (non "-pooler") connection string.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  },
  strict: true,
});
