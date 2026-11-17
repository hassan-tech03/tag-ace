#!/usr/bin/env bash
# Build and (re)start the stack on the server. Safe to run repeatedly.
#
#   cd /opt/mushk && ./deploy/scripts/deploy.sh            # pull + deploy
#   SKIP_PULL=1 ./deploy/scripts/deploy.sh                 # deploy current checkout
#
# Order on every run: postgres (healthy) -> migrate (runs, exits 0) -> web -> caddy.
# If a migration fails, web is not restarted and keeps the previous version.
set -euo pipefail

source "$(dirname "$0")/_lib.sh"

if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  echo "==> git pull"
  git pull --ff-only
fi

echo "==> Building images ($(git rev-parse --short HEAD))"
docker compose build --pull

echo "==> Starting database"
docker compose up -d --wait postgres

echo "==> Running migrations"
docker compose run --rm migrate

echo "==> Starting web + caddy"
# --no-deps: postgres is up and migrations just ran; don't run them twice.
docker compose up -d --no-deps --remove-orphans web caddy

echo "==> Waiting for web to become healthy"
for i in $(seq 1 30); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q web)" 2>/dev/null || echo starting)"
  if [[ "$status" == "healthy" ]]; then
    echo "✔ web is healthy"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "✖ web did not become healthy. Logs:" >&2
    docker compose logs --tail=80 web >&2
    exit 1
  fi
  sleep 3
done

echo "==> Cleaning up old images"
docker image prune -f >/dev/null

docker compose ps
