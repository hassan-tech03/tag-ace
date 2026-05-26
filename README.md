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

### 1. Create a MongoDB Atlas cluster

1. Sign up / log in at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a **Free (M0) Shared cluster**.
3. Under **Database Access**, add a database user with a username + password.
4. Under **Network Access**, allow access from `0.0.0.0/0` for development (tighten this for production).
5. Click **Connect → Drivers** on your cluster and copy the connection string. It looks like `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`. Append a database name, e.g. `/tagace`.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/tagace?retryWrites=true&w=majority"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="a-strong-password"
ADMIN_NAME="Your Name"
```

### 3. Seed the first admin user

```bash
npm run seed:admin
```

This reads `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` from `.env.local`, hashes the password with bcrypt, and writes a `superadmin` document into the `adminusers` collection. Safe to re-run — it updates the existing user if the email already exists.

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

The Categories and Products sections are now fully functional CRUD UIs backed by MongoDB collections (`categories`, `products`). The storefront still reads its hardcoded data — Phase 2 only adds the admin side. Wiring the storefront to MongoDB is a later step.

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
- **Stripe orders** — `POST /api/create-payment-intent` now creates a pending order in MongoDB before redirecting to Stripe Checkout. The order id is embedded in `session.metadata.orderId`. When Stripe sends the `checkout.session.completed` webhook, `POST /api/webhooks/stripe` flips the order's `paymentStatus` to `paid` and `status` to `processing`. If the session expires or async payment fails, the order is marked `failed` / `cancelled`. Refunds (`charge.refunded`) flip it to `refunded`.

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

