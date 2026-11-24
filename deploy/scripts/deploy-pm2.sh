#!/usr/bin/env bash
# Deploy without Docker: for a managed container that already provides
# Node 22, PM2 and Postgres (DATABASE_URL), with public "/" -> :3000 and
# public "/api" -> :4000.
#
#   cd /work/mushk && ./deploy/scripts/deploy-pm2.sh          # pull + deploy
#   SKIP_PULL=1 ./deploy/scripts/deploy-pm2.sh                # current checkout
#
# Secrets: apps/web/.env.local (see apps/web/.env.example). DATABASE_URL can
# come from there or from the container environment.
set -euo pipefail

cd "$(dirname "$0")/../.."

if [[ ! -f apps/web/.env.local ]]; then
  echo "✖ apps/web/.env.local not found (copy apps/web/.env.example and fill it in)." >&2
  exit 1
fi

if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  echo "==> git pull"
  git pull --ff-only
fi
echo "==> Deploying $(git rev-parse --short HEAD)"

echo "==> Installing dependencies"
npm ci --no-audit --no-fund --loglevel=error

echo "==> Running migrations"
npm run db:migrate

echo "==> Building"
# The container has ~3 GB RAM shared with Postgres; cap the build's heap.
NODE_OPTIONS=--max-old-space-size=2048 npm run build

echo "==> (Re)starting processes"
pm2 startOrReload deploy/pm2/ecosystem.config.cjs --update-env
pm2 save >/dev/null

echo "==> Health check"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null 2>&1 &&
     curl -fsS http://127.0.0.1:4000/api/health >/dev/null 2>&1; then
    echo "✔ web (:3000) and api proxy (:4000) are healthy"
    pm2 ls
    exit 0
  fi
  sleep 2
done
echo "✖ health check failed. Recent logs:" >&2
pm2 logs mushk-web --lines 60 --nostream >&2
exit 1
