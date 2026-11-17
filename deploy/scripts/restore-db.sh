#!/usr/bin/env bash
# Restores a dump made by backup-db.sh. REPLACES all current data.
#
#   ./deploy/scripts/restore-db.sh backups/mushk-20261117-030000.dump
set -euo pipefail

source "$(dirname "$0")/_lib.sh"
file="${1:?Usage: restore-db.sh <dump file>}"
[[ -f "$file" ]] || { echo "✖ $file not found" >&2; exit 1; }

read -r -p "This replaces ALL data in '$DB_NAME' with $file. Type the database name to continue: " answer
[[ "$answer" == "$DB_NAME" ]] || { echo "Aborted."; exit 1; }

echo "==> Stopping web"
docker compose stop web

echo "==> Restoring"
docker compose exec -T postgres pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --single-transaction < "$file"

echo "==> Starting web"
docker compose up -d --no-deps web
echo "✔ Restored $file"
