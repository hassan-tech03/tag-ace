#!/usr/bin/env bash
# Dumps the production database to ./backups/mushk-YYYYmmdd-HHMMSS.dump
# (custom format, compressed) and deletes dumps older than KEEP_DAYS.
#
#   ./deploy/scripts/backup-db.sh
#
# Nightly at 03:00 (crontab -e as the deploy user):
#   0 3 * * * cd /opt/mushk && ./deploy/scripts/backup-db.sh >> backups/backup.log 2>&1
#
# Copy backups off the server too (e.g. rclone to Google Drive / Backblaze),
# a dump that lives only on the same VPS won't survive losing the VPS.
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
KEEP_DAYS="${KEEP_DAYS:-14}"
mkdir -p backups

file="backups/${DB_NAME}-$(date +%Y%m%d-%H%M%S).dump"
docker compose exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc --no-owner > "$file.partial"
mv "$file.partial" "$file"
echo "✔ $(date '+%F %T') backup written: $file ($(du -h "$file" | cut -f1))"

find backups -name "${DB_NAME}-*.dump" -mtime +"$KEEP_DAYS" -print -delete
