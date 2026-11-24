# Deploying to Contabo

There are two ways to run the app, depending on what the server gives you:

| Server | Use |
|---|---|
| **Managed container** (Node + PM2 + Postgres already provided, no Docker, public `/` → :3000 and `/api` → :4000). This is the current production setup. | [PM2 deploy](#pm2-deploy-managed-container) below |
| **Full VPS** with root and Docker | [Docker Compose deploy](#docker-compose-deploy-full-vps) |

## PM2 deploy (managed container)

Live at `/work/mushk` on the server (`ssh hassan@169.58.171.233`).

| Process | What it is |
|---|---|
| `mushk-web` | `next start` on :3000 (pages + all `/api` routes) |
| `mushk-api` | `deploy/pm2/api-proxy.mjs` on :4000: the platform sends public `/api` here, and it forwards to :3000 |
| `mushk-backup` | nightly 03:00 database backup to `/work/backups` (keeps 14 days) |

- **Secrets:** `apps/web/.env.local` on the server (mode 600, never committed). `DATABASE_URL` points at the container's Postgres 16.
- **Domain:** `NEXTAUTH_URL` and `NEXT_PUBLIC_DOMAIN` are left unset on purpose. NextAuth (`AUTH_TRUST_HOST=true`) and the Stripe return URLs take the public host from the proxy headers, so a domain can be attached without a rebuild.
- PM2 processes come back after a container restart (`pm2 save` + `pm2 resurrect`).

**Deploy a new version** (after pushing to `main`):

```bash
ssh hassan@169.58.171.233
cd /work/mushk && ./deploy/scripts/deploy-pm2.sh
```

The script pulls the code, installs packages, runs migrations, builds with a 2 GB heap cap (the container has 3 GB), reloads PM2 and checks `/api/health` on :3000 and :4000.

| Task | Command (in `/work/mushk`) |
|---|---|
| Status / logs | `pm2 ls` · `pm2 logs mushk-web` |
| Restart | `pm2 restart mushk-web` |
| Backup now | `pm2 restart mushk-backup` (or `npm run db:backup -- /work/backups`) |
| Restore | `npm run db:migrate && npm run db:restore -- /work/backups/<file>.json.gz --yes` |
| SQL shell | `psql "$DATABASE_URL"` |
| Reset admin password | edit `ADMIN_PASSWORD` in `apps/web/.env.local`, then `npm run seed:admin` |

The container's `pg_dump` is version 15, while the server is 16, so backups are JSON data exports (`packages/db/scripts/backup-json.mjs`). The schema comes from the migrations. Copy backups off the server from time to time: `scp 'hassan@169.58.171.233:/work/backups/*' .`

---

## Docker Compose deploy (full VPS)

Everything runs on one VPS with Docker Compose:

```
Internet ──► Caddy :80/:443 (auto HTTPS) ──► web :3000 (Next.js) ──► postgres :5432
                                                   ▲
                                 migrate (runs migrations on every deploy, then exits)
```

| Service | Image | Notes |
|---|---|---|
| `postgres` | `postgres:18-alpine` | data in the `pgdata` volume; port bound to `127.0.0.1` only |
| `migrate` | `mushk-tools` (built) | `packages/db/scripts/migrate.mjs`; also runs the seed scripts |
| `web` | `mushk-web` (built) | Next.js standalone server, healthcheck at `/api/health` |
| `caddy` | `caddy:2-alpine` | Let's Encrypt certificates, `www` → apex redirect, gzip/zstd |

Product images stay on Cloudinary. Payments go through Stripe. Nothing else is needed.

**Recommended VPS:** Cloud VPS 10 or larger (4+ vCPU, 8 GB RAM), Ubuntu 24.04. The image is built on the server, and a Next.js build needs about 2–3 GB of RAM. The setup script adds 4 GB of swap as headroom.

---

## 1. Create the server

1. Order a Contabo VPS with **Ubuntu 24.04**, add your **SSH public key** during checkout and choose a region (EU or Singapore are closest to Pakistan).
2. Note the server's IPv4 address from the Contabo panel.

## 2. Point the domain (Hostinger DNS)

In Hostinger: **Domains → mushkscents.com → DNS / Nameservers → DNS records**:

| Type | Name | Points to | TTL |
|---|---|---|---|
| A | `@` | `<server-ip>` | 300 |
| A | `www` | `<server-ip>` | 300 |

Delete any other `A`, `AAAA` or `CNAME` records for `@` and `www`, such as Hostinger's default parking records. Leave the MX/TXT records for email (Zoho) alone.

Check with `dig +short mushkscents.com` that it shows your IP before step 5. Caddy can only get a certificate once DNS points at the server.

> **No domain yet?** Use `DOMAIN=<ip-with-dashes>.sslip.io` (e.g. `203-0-113-10.sslip.io`). It resolves to your IP automatically and gets a real HTTPS certificate.

## 3. Bootstrap the server (once)

```bash
ssh root@<server-ip>
curl -fsSL https://raw.githubusercontent.com/hassan-tech03/tag-ace/main/deploy/scripts/server-setup.sh -o setup.sh
bash setup.sh
```

The script installs updates, Docker, a firewall (SSH/80/443 only), fail2ban, swap and automatic security updates. It also creates a `deploy` user with your SSH key and the `/opt/mushk` directory.

Then log in as `deploy` from a **new** terminal to make sure it works:

```bash
ssh deploy@<server-ip>
```

Optional, once key login for `deploy` works: disable root and password login.

```bash
sudo HARDEN_SSH=1 bash setup.sh
```

## 4. Get the code and configure

```bash
git clone https://github.com/hassan-tech03/tag-ace.git /opt/mushk
cd /opt/mushk
cp .env.example .env
nano .env
```

Fill in:

| Variable | Value |
|---|---|
| `DOMAIN` | `mushkscents.com` |
| `ACME_EMAIL` | your email (Let's Encrypt expiry notices) |
| `POSTGRES_PASSWORD` | output of `openssl rand -hex 24` |
| `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | admin login (use a strong password) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` | Stripe keys |
| `STRIPE_WEBHOOK_SECRET` | from step 7 (can be added later) |
| `CLOUDINARY_*` | same 3 values as now |

`chmod 600 .env`. Don't use quotes, and don't put spaces around `=`.

## 5. First deploy

```bash
./deploy/scripts/deploy.sh
```

The first build takes about 5–10 minutes, and later builds are faster because of the cache. The script builds the images, starts Postgres, runs migrations, then starts `web` and `caddy` and waits for the healthcheck.

Open `https://mushkscents.com`. The certificate is issued within a few seconds of the first request.

## 6. Data: fresh start or copy from Neon

**Option A: fresh database**

```bash
docker compose run --rm migrate node scripts/seed-admin.mjs
docker compose run --rm migrate node scripts/seed-products.mjs   # optional sample catalogue
```

**Option B: copy everything from Neon** (products, orders, admin users, settings…)

```bash
NEON_URL='postgresql://mushk_owner:<password>@<neon-direct-host>/mushk?sslmode=require' \
  ./deploy/scripts/import-from-neon.sh
```

Use Neon's **direct** connection string (host without `-pooler`) with `sslmode=require`. The script dumps Neon's `public` and `drizzle` schemas, replaces the server database with them, prints row counts and restarts the app. A copy of the dump stays in `backups/`. Your admin login is the same as it was on Neon.

Once you're happy with the new server, you can delete the Neon project.

## 7. Stripe webhook

Stripe dashboard → **Developers → Webhooks → Add endpoint**:

- URL: `https://mushkscents.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `charge.refunded`

Put the signing secret (`whsec_…`) into `STRIPE_WEBHOOK_SECRET` in `.env`, then run `./deploy/scripts/deploy.sh`.

## 8. Backups

```bash
./deploy/scripts/backup-db.sh                 # writes backups/mushk-<date>.dump
crontab -e                                    # nightly at 03:00, keeps 14 days:
0 3 * * * cd /opt/mushk && ./deploy/scripts/backup-db.sh >> backups/backup.log 2>&1
```

Restore with `./deploy/scripts/restore-db.sh backups/<file>.dump`. It asks for confirmation first.

Keep a copy **off** the server too, for example with `rclone` to Google Drive or Backblaze B2, or by downloading it with `scp deploy@<ip>:/opt/mushk/backups/*.dump .`. Contabo's paid snapshot/backup add-on also helps.

---

## Day-to-day

**Deploy a new version:** push to `main`, then on the server:

```bash
cd /opt/mushk && ./deploy/scripts/deploy.sh
```

**Automatic deploys (optional):** `.github/workflows/deploy.yml` SSHes in and runs the same script on every push to `main`. Create a key pair just for this:

```bash
ssh-keygen -t ed25519 -f mushk_deploy -N ""          # on your PC
ssh-copy-id -i mushk_deploy.pub deploy@<server-ip>
```

Then add these GitHub secrets under **Settings → Secrets and variables → Actions**: `CONTABO_HOST` (the IP), `CONTABO_USER` (`deploy`) and `CONTABO_SSH_KEY` (contents of `mushk_deploy`). Until they're set, the workflow skips.

| Task | Command |
|---|---|
| Status | `docker compose ps` |
| Logs | `docker compose logs -f web` (or `caddy`, `postgres`) |
| Restart app | `docker compose restart web` |
| Health | `curl -s https://mushkscents.com/api/health` |
| SQL shell | `docker compose exec postgres psql -U mushk mushk` |
| Reset admin password | edit `ADMIN_PASSWORD` in `.env`, then `docker compose run --rm migrate node scripts/seed-admin.mjs` |
| Disk usage | `docker system df` · clean up: `docker system prune` (never add `--volumes`) |

**Connect a GUI (TablePlus, DBeaver, pgAdmin) to the server database** through an SSH tunnel. Port 5432 is never open to the internet.

```bash
ssh -N -L 5433:127.0.0.1:5432 deploy@<server-ip>
# then connect to localhost:5433, user/db mushk, password = POSTGRES_PASSWORD
```

**Environment changes:** edit `.env`, then run `./deploy/scripts/deploy.sh`. A rebuild is required for `NEXT_PUBLIC_*` values and `DOMAIN`, because they're baked into the browser bundle.

## Troubleshooting

- **Certificate not issued / site not reachable:** run `docker compose logs caddy`. Usually DNS doesn't point at the server yet, or ports 80/443 are blocked. Check the Contabo firewall in the panel as well as UFW.
- **`web` unhealthy:** run `docker compose logs web`. `/api/health` returns 503 when Postgres is unreachable.
- **Migration failed during deploy:** the old `web` container keeps running. Fix the migration, push, and deploy again.
- **Build killed (exit 137):** the server ran out of memory. Check `free -h` and that swap is on, or upgrade the VPS.
- **Admin login loops back to the login page:** check that `DOMAIN` is correct, because `NEXTAUTH_URL` comes from it, and that you're using `https://`.
