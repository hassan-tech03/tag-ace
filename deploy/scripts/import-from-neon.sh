#!/usr/bin/env bash
# One-time move of the existing data from Neon into the server's Postgres.
#
#   NEON_URL='postgresql://mushk_owner:...@ep-xxx.us-east-1.aws.neon.tech/mushk?sslmode=require' \
#     ./deploy/scripts/import-from-neon.sh
#
# Use Neon's DIRECT connection string (host without "-pooler") with
# sslmode=require (verify-full needs a CA file the container doesn't have).
# It copies the `public` schema (all tables + data) and the `drizzle` schema
# (migration history), so later migrations continue from the right place.
# Everything currently in the server database is REPLACED.
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
: "${NEON_URL:?Set NEON_URL to the Neon direct connection string}"

read -r -p "This REPLACES all data in the server database '$DB_NAME' with Neon's. Type the database name to continue: " answer
[[ "$answer" == "$DB_NAME" ]] || { echo "Aborted."; exit 1; }

docker compose up -d --wait postgres
echo "==> Stopping web"
docker compose stop web || true

dump="backups/neon-import-$(date +%Y%m%d-%H%M%S).dump"
mkdir -p backups

echo "==> Dumping from Neon (pg_dump runs inside the postgres container)"
docker compose exec -T -e NEON_URL="$NEON_URL" postgres \
  sh -c 'pg_dump "$NEON_URL" -Fc --no-owner --no-privileges --schema=public --schema=drizzle' > "$dump"
echo "    saved $dump ($(du -h "$dump" | cut -f1))"

before="backups/pre-import-$(date +%Y%m%d-%H%M%S).dump"
echo "==> Backing up the current server database to $before"
docker compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc --no-owner > "$before"

echo "==> Resetting local schemas"
# The dump recreates both schemas itself.
docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -q -v ON_ERROR_STOP=1 -c \
  "SET client_min_messages = warning; DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA IF EXISTS public CASCADE;"

echo "==> Restoring into $DB_NAME"
if ! docker compose exec -T postgres pg_restore -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges --exit-on-error --single-transaction < "$dump"; then
  echo "✖ Restore failed. Put the previous data back with:" >&2
  echo "    ./deploy/scripts/restore-db.sh $before" >&2
  exit 1
fi
docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -q -c "ANALYZE;"

echo "==> Row counts"
docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c \
  "SELECT relname AS table, n_live_tup AS rows FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY relname;"

echo "==> Applying any newer migrations and starting web"
docker compose run --rm migrate
docker compose up -d --no-deps web
echo "✔ Import finished."
