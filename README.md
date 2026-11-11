This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Admin Panel

The admin panel lives at `/admin` and is gated behind NextAuth (email + password). Phase 1 ships the foundation: authentication, layout, routing, and placeholder pages for every section. Real CRUD lands in later phases.

### 1. Create a Neon Postgres database

1. Sign up / log in at [console.neon.tech](https://console.neon.tech) and create a project.
2. Click **Connect** and copy two connection strings:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL` (used by the app)
   - **Direct** (pooling toggled off) → `DATABASE_URL_UNPOOLED` (used by migrations and scripts)

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="a-strong-password"
ADMIN_NAME="Your Name"
```

### 3. Create the tables and seed

```bash
npm run db:migrate      # applies the SQL migrations in ./drizzle
npm run seed:admin      # first admin user (superadmin)
npm run seed:products   # optional: 19 sample products (men + women)
```

`seed:admin` hashes the password with bcrypt and upserts the user, so it's safe to re-run. Moving over from the old MongoDB setup? Set `MONGODB_URI` as well and run `npm run migrate:mongo` instead of `seed:products`. It copies every collection into Neon and only reads from Mongo.

The schema lives in `src/lib/db/schema.js` (Drizzle ORM). After changing it, run `npm run db:generate` to write a new migration, commit it, then `npm run db:migrate`.

### 4. Sign in

```bash
npm run dev
```

Visit [http://localhost:3000/admin](http://localhost:3000/admin). You will be redirected to `/admin/login`. Enter the credentials you seeded.

### Notes

- The admin panel (Mushk Admin) uses **Tailwind CSS** scoped to admin files only (`tailwind.config.mjs` restricts `content`, and `preflight` is disabled so the storefront's Bootstrap styles are untouched).
- All `/admin/*` and `/api/admin/*` routes are protected by `src/middleware.js`. Unauthenticated requests to API routes get a 401; page requests are redirected to the login form.
- Sessions are JWT-based and last 8 hours.

### Phase 2: Products & Categories

The Categories and Products sections are now fully functional CRUD UIs backed by the `categories` and `products` tables in Neon Postgres. The storefront has two categories: **men** and **women**.

#### Image uploads (optional Cloudinary)

The product form has an image uploader that supports both:

1. **Direct upload** — uploads files to Cloudinary via `/api/admin/upload`.
2. **URL paste** — paste any public image URL (no Cloudinary required).

To enable direct upload, sign up free at [cloudinary.com](https://cloudinary.com), then on your dashboard copy **Cloud name**, **API Key**, and **API Secret** into `.env.local`:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnop_qrstuvwxyz
```

Restart `npm run dev` after editing `.env.local`. Uploads go to the `mushk/products` folder in your Cloudinary account. Max 5MB per file.

If you skip Cloudinary, just use the "Add URL" input — any HTTPS image URL works.

### Phase 3: Orders & Stripe webhook

The Orders section (`/admin/orders`) shows every order that comes through the storefront, whether the customer paid with **Stripe** or chose **Cash on Delivery**. From the detail page you can update fulfillment status (`pending` → `processing` → `shipped` → `delivered` / `cancelled`), update payment status, and leave admin-only notes.

#### How orders get into the database

- **COD orders** — `CheckoutClient.jsx` posts to `POST /api/orders` when the buyer clicks **Place Order** with Cash on Delivery selected. The order is created with `paymentMethod=cod` and `paymentStatus=cod_pending`. The buyer is then redirected to `/order-confirmation` as before.
- **Stripe orders** — `POST /api/create-payment-intent` now creates a pending order in Postgres before redirecting to Stripe Checkout. The order id is embedded in `session.metadata.orderId`. When Stripe sends the `checkout.session.completed` webhook, `POST /api/webhooks/stripe` flips the order's `paymentStatus` to `paid` and `status` to `processing`. If the session expires or async payment fails, the order is marked `failed` / `cancelled`. Refunds (`charge.refunded`) flip it to `refunded`.

#### Configuring the Stripe webhook (required for "paid" to appear)

**Local dev** — install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then in a terminal:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook signing secret like `whsec_xxxxxxxxxxxx`. Copy it into `.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

Restart `npm run dev`. Now Stripe test-mode payments will mark orders paid automatically.

**Production** — go to the [Stripe dashboard webhooks](https://dashboard.stripe.com/webhooks), add an endpoint pointing to `https://your-domain.com/api/webhooks/stripe`, and subscribe to at least:

- `checkout.session.completed`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`
- `charge.refunded`

Copy the **Signing secret** into the production `STRIPE_WEBHOOK_SECRET` env var.

#### Without the webhook configured

The admin panel and Stripe checkout will still work. The only side effect is that Stripe orders sit at `paymentStatus=pending` indefinitely — you can manually flip them to `paid` from the order detail page after verifying in the Stripe dashboard.

