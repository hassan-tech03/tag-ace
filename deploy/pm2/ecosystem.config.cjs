// PM2 process list for hosts without Docker (e.g. a managed container with
// Node + PM2 + Postgres). Used by deploy/scripts/deploy-pm2.sh.
//
// Secrets live in apps/web/.env.local (Next.js loads it on start).
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

module.exports = {
  apps: [
    {
      name: "mushk-web",
      cwd: path.join(root, "apps/web"),
      script: path.join(root, "node_modules/next/dist/bin/next"),
      args: "start -p 3000 -H 0.0.0.0",
      env: {
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
        // Let NextAuth take the public host from the proxy headers, so no
        // NEXTAUTH_URL is needed and the domain can change without a rebuild.
        AUTH_TRUST_HOST: "true",
      },
      max_memory_restart: "1200M",
      kill_timeout: 10000,
      time: true,
    },
    {
      // The platform routes public "/api" to :4000; forward it to Next.js.
      name: "mushk-api",
      cwd: root,
      script: path.join(root, "deploy/pm2/api-proxy.mjs"),
      env: { PORT: "4000", TARGET_PORT: "3000" },
      max_memory_restart: "150M",
      time: true,
    },
  ],
};
