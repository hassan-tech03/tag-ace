# Deploying Mushk Perfumes to Vercel (Free / Hobby plan)

This project is now a **dynamic** Next.js 14 app:

- Neon Postgres + Drizzle ORM (products, orders, customers, admin)
- NextAuth.js (admin login)
- Stripe (checkout sessions + webhook)
- Cloudinary (product image uploads)

Everything fits inside Vercel's free **Hobby** tier as long as you stay under
the bandwidth/function-hour caps.

---

## 0) One-time prep on third-party services

### 0.1 Neon — create the database

1. https://console.neon.tech → **New project** (pick the region closest to
   your Vercel region, e.g. `aws-us-east-1` for Vercel's default `iad1`).
2. **Connect** → copy two connection strings:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL`
   - **Direct** (toggle "Connection pooling" off) → `DATABASE_URL_UNPOOLED`
3. Put both in `.env.local`, then from your machine run once:

```bash
npm run db:migrate      # creates the tables (uses the direct URL)
npm run seed:admin      # first admin user
npm run seed:products   # optional: the 19 sample products
# OR, to bring over the existing MongoDB data instead of the samples:
npm run migrate:mongo   # needs MONGODB_URI too; Mongo is only read
```

No IP allow-listing is needed; Neon accepts TLS connections from anywhere by
default.

### 0.2 Cloudinary

You already have these in `.env.local`. Reuse them — no changes needed.

### 0.3 Stripe

You already have **test mode** keys. We'll wire the webhook *after* the first
deploy when the production URL exists.

---

## 1) Push to GitHub

```bash
git status
git add -A
git commit -m "Production-ready Vercel deploy"
git push origin admin-dashboard
```

> The current branch is `admin-dashboard`. On Vercel you'll tell it to deploy
> this branch as **Production**.

---

## 2) Create the Vercel project

1. Go to https://vercel.com/new
2. **Import Git Repository** → pick the `tag-ace` repo.
3. Framework Preset: **Next.js** (auto-detected).
4. Build & Output settings: leave the defaults — `vercel.json` already pins
   `next build`.
5. **DO NOT click Deploy yet.** Open the **Environment Variables** section
   first and paste the values from step 3 below.

---

## 3) Environment variables (paste into Vercel → Settings → Environment Variables)

Set **Environment** = `Production`, `Preview`, and `Development` for each one
unless noted otherwise.

| Variable | Value (use yours) | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...-pooler...neon.tech/neondb?sslmode=require` | Neon **pooled** string, from `.env.local` |
| `NEXTAUTH_SECRET` | from `.env.local` | Same secret across all environments |
| `NEXTAUTH_URL` | **temp**: `https://YOUR-PROJECT.vercel.app` | Update after deploy |
| `NEXT_PUBLIC_DOMAIN` | **temp**: `https://YOUR-PROJECT.vercel.app` | Update after deploy |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | From `.env.local` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | From `.env.local` |
| `STRIPE_WEBHOOK_SECRET` | **placeholder** `whsec_placeholder` | Real value comes in step 6 |
| `CLOUDINARY_CLOUD_NAME` | from `.env.local` | |
| `CLOUDINARY_API_KEY` | from `.env.local` | |
| `CLOUDINARY_API_SECRET` | from `.env.local` | |

> `ADMIN_*` and `DATABASE_URL_UNPOOLED` are only used by the CLI scripts you
> run locally; they don't need to be in Vercel.
>
> **Tip:** instead of pasting `DATABASE_URL` by hand you can add the Neon
> integration from Vercel → Storage; it sets `DATABASE_URL` for you.

Now click **Deploy**. First deploy will take 2–4 minutes.

---

## 4) After the first deploy

Vercel will give you a URL like `https://tag-ace-xxx.vercel.app`.

1. Go to **Settings → Environment Variables**.
2. Edit `NEXTAUTH_URL` and `NEXT_PUBLIC_DOMAIN` and set both to the real URL
   (no trailing slash, must be `https://`).
3. **Deployments → ⋯ → Redeploy** (no need to push again). This rebuild will
   pick up the new env vars.

> If you skip this step the admin login will redirect to localhost and Stripe
> success/cancel URLs will be wrong.

---

## 5) Seed the database

Done in step 0.1. When the schema changes later (`src/lib/db/schema.js`):

```bash
npm run db:generate    # writes a new SQL migration into ./drizzle (commit it)
npm run db:migrate     # applies it to the database in DATABASE_URL_UNPOOLED
```

Tip: try a migration on a Neon **branch** of production first.

---

## 6) Wire up the Stripe webhook (production)

1. https://dashboard.stripe.com/test/webhooks → **+ Add endpoint**
2. Endpoint URL: `https://YOUR-PROJECT.vercel.app/api/webhooks/stripe`
3. Events to send:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
   - `charge.refunded`
4. Click **Add endpoint**.
5. Open the new endpoint → reveal **Signing secret** (starts with `whsec_...`).
6. Back in Vercel → Settings → Environment Variables → edit
   `STRIPE_WEBHOOK_SECRET` and paste it.
7. **Redeploy** so the new value is picked up.

You can verify it works by:

- Placing a test order on the live site with card `4242 4242 4242 4242`.
- Opening **Stripe Dashboard → Webhooks → your endpoint → "Recent events"**
  and confirming the event returned `200`.
- Opening **/admin/orders** on the live site and confirming the order shows
  `paid` / `processing`.

---

## 7) Smoke-test the live site

After redeploy:

- [ ] `/` homepage loads, products visible.
- [ ] `/shop`, `/shop/men`, `/shop/women` show products (`/shop/unisex` redirects to `/shop`).
- [ ] `/products/<slug>` opens a real product detail page.
- [ ] Search modal (header magnifier) returns API results.
- [ ] `/admin/login` lets you log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded.
- [ ] `/admin` dashboard loads stats.
- [ ] Place a card order → Stripe Checkout → success page.
- [ ] Place a COD order → success page.

---

## 8) Things to watch on the free Hobby tier

- **Bandwidth**: 100 GB/month. Cloudinary images don't count against this
  (they're served from Cloudinary's CDN), which is good — we already point
  product images to Cloudinary.
- **Function execution**: 100 GB-hours/month. Each request to an API route
  counts; webhook + checkout intent are the busiest.
- **Function timeout**: capped at 60 s on Hobby. `vercel.json` already sets
  30 s for the Stripe and admin routes — plenty of headroom.
- **Cold starts**: Neon's free tier suspends the database after ~5 min idle.
  The first request after that takes a few hundred ms extra while it wakes.
  The `pg` pool is reused across warm invocations (`src/lib/db/index.js`).

---

## 9) Going live with real money

When you're ready to accept real cards:

1. Switch Stripe to **live mode** (top-right toggle in Stripe Dashboard).
2. Update Vercel envs:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - Create a new **live** webhook at `https://YOUR-DOMAIN/api/webhooks/stripe`
     and update `STRIPE_WEBHOOK_SECRET`.
3. Redeploy.

---

## Troubleshooting

**Build fails with "Module not found"**
Make sure every new file is committed. Vercel only sees what's in Git.

**Build fails with `Cannot find module 'tailwindcss'` (or `postcss` / `autoprefixer`)**
You manually set `NODE_ENV=production` in Vercel's Environment Variables.
That makes `npm install` skip `devDependencies`. **Delete the `NODE_ENV`
variable** in Vercel (it's auto-set during prod builds — never set it
yourself), then redeploy. The PostCSS toolchain is now also listed under
`dependencies` so this should not recur, but the `NODE_ENV` entry will
break other things downstream and should still be removed.

**Admin login redirects forever**
`NEXTAUTH_URL` must exactly match your deployed URL (`https://...`, no slash).
Redeploy after changing it.

**"Failed to create checkout session" on Pay with Stripe**
Open Vercel → Deployments → latest → **Functions logs**. The route already
logs full Stripe errors. Usually means `STRIPE_SECRET_KEY` is wrong/missing
or `NEXT_PUBLIC_DOMAIN` doesn't start with `https://`.

**Stripe webhook returns 400**
The `STRIPE_WEBHOOK_SECRET` in Vercel doesn't match the value shown in the
Stripe dashboard webhook page. Copy it again and redeploy.

**`DATABASE_URL is not defined`**
The env var is missing in Vercel (or `.env.local` locally). Add the Neon
pooled connection string and redeploy.

**`relation "products" does not exist`**
Migrations haven't been applied to this database: `npm run db:migrate`.

**Migration fails with `prepared statement ... already exists`**
You ran it over the pooled URL. Set `DATABASE_URL_UNPOOLED` to the direct
(non `-pooler`) string.
