# Shared helpers for the deploy scripts. Source it, don't run it.

# Move to the repo root (scripts live in deploy/scripts/).
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

[[ -f .env ]] || { echo "✖ .env not found. Copy .env.example to .env and fill it in." >&2; exit 1; }

# env_get KEY [default]: reads KEY from .env without sourcing it, so secrets
# containing $, spaces or quotes can't break (or run as) shell code.
env_get() {
  local value
  value="$(grep -E "^${1}=" .env | tail -n1 | cut -d= -f2-)"
  value="${value%\"}"; value="${value#\"}"
  value="${value%\'}"; value="${value#\'}"
  printf '%s' "${value:-${2:-}}"
}

DB_NAME="$(env_get POSTGRES_DB mushk)"
DB_USER="$(env_get POSTGRES_USER mushk)"
