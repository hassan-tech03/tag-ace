import fs from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't read env files on its own. Locally the connection
// string lives in apps/web/.env.local; on the server it comes from the env.
for (const file of [".env", "../../apps/web/.env.local"]) {
  if (!process.env.DATABASE_URL && fs.existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.js",
  out: "./migrations",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
});
