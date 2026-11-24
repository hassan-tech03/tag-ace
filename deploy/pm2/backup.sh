#!/usr/bin/env bash
# Nightly database backup for the PM2 deploy (no cron in the container; PM2
# runs this on a schedule, see ecosystem.config.cjs).
#
# Uses pg_dump when its version matches the server, otherwise a JSON data
# export (packages/db/scripts/backup-json.mjs), restorable with
# restore-json.mjs after running migrations.
# Output: /work/backups, keeps KEEP_DAYS days.
set -euo pipefail

cd "$(dirname "$0")/../.."
BACKUP_DIR="${BACKUP_DIR:-/work/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
mkdir -p "$BACKUP_DIR"

url="${DATABASE_URL:-}"
if [[ -z "$url" && -f apps/web/.env.local ]]; then
  url="$(grep -E '^DATABASE_URL=' apps/web/.env.local | tail -n1 | cut -d= -f2-)"
fi
[[ -n "$url" ]] || { echo "✖ DATABASE_URL not set" >&2; exit 1; }

client_major="$(pg_dump --version 2>/dev/null | grep -oE '[0-9]+' | head -1 || true)"
server_major="$(psql "$url" -Atc 'SHOW server_version_num' 2>/dev/null | cut -c1-2 || true)"

if [[ -n "$client_major" && "$client_major" == "$server_major" ]]; then
  file="$BACKUP_DIR/mushk-$(date +%Y%m%d-%H%M%S).dump"
  pg_dump "$url" -Fc --no-owner > "$file.partial"
  mv "$file.partial" "$file"
  echo "✔ $(date '+%F %T') pg_dump backup: $file ($(du -h "$file" | cut -f1))"
else
  DATABASE_URL="$url" node packages/db/scripts/backup-json.mjs "$BACKUP_DIR"
fi

find "$BACKUP_DIR" \( -name 'mushk-*.dump' -o -name 'mushk-*.json.gz' -o -name '*.partial' \) \
  -mtime +"$KEEP_DAYS" -print -delete
