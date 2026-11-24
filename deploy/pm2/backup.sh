#!/usr/bin/env bash
# Nightly Postgres backup for the PM2 deploy (no cron in the container; PM2
# runs this on a schedule, see ecosystem.config.cjs).
# Writes /work/backups/mushk-YYYYmmdd-HHMMSS.dump and keeps KEEP_DAYS days.
set -euo pipefail

cd "$(dirname "$0")/../.."
BACKUP_DIR="${BACKUP_DIR:-/work/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"

url="${DATABASE_URL:-}"
if [[ -z "$url" && -f apps/web/.env.local ]]; then
  url="$(grep -E '^DATABASE_URL=' apps/web/.env.local | tail -n1 | cut -d= -f2-)"
fi
[[ -n "$url" ]] || { echo "✖ DATABASE_URL not set" >&2; exit 1; }

mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/mushk-$(date +%Y%m%d-%H%M%S).dump"
pg_dump "$url" -Fc --no-owner > "$file.partial"
mv "$file.partial" "$file"
echo "✔ $(date '+%F %T') backup: $file ($(du -h "$file" | cut -f1))"

find "$BACKUP_DIR" -name 'mushk-*.dump' -mtime +"$KEEP_DAYS" -print -delete
