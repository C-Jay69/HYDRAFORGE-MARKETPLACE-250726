# HYDRAFORGE Marketplace

A **SaaS marketplace**: browse production apps and platforms (e-commerce, dating,
resume builders, …), try them via **live demos**, then **buy directly through each
seller's payment portal**. Anyone who signs up can list their own app for sale —
with a demo, screenshots, a price, and a link to their payment page.

## Features

- **Marketplace** (`/`) — public product grid with category filter and search.
- **Product detail** (`/product/[slug]`) — screenshot gallery, price, a **live
  demo** (embedded iframe or external demo link), and a **Buy now** button that
  sends buyers to the seller's payment portal.
- **Studio** (`/studio`) — email magic-link sign-in. Every signed-up user can
  create / edit / publish / delete **their own** listings, upload screenshots,
  set a demo and price, and add a purchase link.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Supabase** — Postgres (via Drizzle ORM) + Auth (email magic-link) + Storage (screenshots)
- **Drizzle ORM** + `drizzle-kit` migrations
- Deploy target: **Vercel**

---

## Local setup

### 1. Prerequisites

- Node.js **20+** and npm (or bun)
- A **Supabase** account (free tier is fine)

### 2. Install dependencies

```bash
npm install
```

### 3. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Note the **Database password** you set — you'll need it for the connection string.

### 4. Configure environment variables

Copy the example and fill it in:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Project Settings → API** → *Project URL* | Public, safe in the browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Settings → API** → *anon / publishable key* | Public, safe in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | **Settings → API** → *service_role key* | **Server only** — never expose |
| `DATABASE_URL` | **Settings → Database** → *Connection string* (PostgreSQL) | Used by Drizzle migrations |
| `NEXT_PUBLIC_SITE_URL` | Your own domain | Base URL for the magic-link email redirect |
| `CRON_SECRET` | Any random string (optional) | Protects the keep-alive endpoint |

### 5. Create the database tables

`drizzle-kit` reads `DATABASE_URL` from a `.env` file (not `.env.local`). Either
create a `.env` with the same `DATABASE_URL` value, or pass it inline:

```bash
DATABASE_URL="postgresql://postgres:...@db.YOUR-PROJECT.supabase.co:5432/postgres" npx drizzle-kit migrate
```

> If you ever change `src/lib/db/schema.ts`, generate a new migration first with
> `npx drizzle-kit generate`, then apply it with `npx drizzle-kit migrate`.
> The SQL files in `drizzle/` can also be run manually in Supabase → **SQL Editor**.

### 6. Set up Storage (for screenshots)

1. Supabase → **Storage → New bucket**.
2. Name it **`product-screenshots`** exactly.
3. Set it to **Public** (so images render on the marketplace).

> Uploads are signed server-side with the service-role key, so no client-side RLS
> policies are needed.

### 7. Enable email magic-link auth

1. Supabase → **Authentication → Providers → Email**.
2. Enable the **Email** provider and save.
3. Go to **Authentication → URL Configuration → Redirect URLs** and add:
   - `http://localhost:3000/auth/callback`
   - `https://your-app.vercel.app/auth/callback` (your production URL, once you deploy)

### 8. Run it

```bash
npm run dev
```

Open http://localhost:3000.

---

## How to use

### As a buyer

1. Browse the grid on `/` and filter by **category** or **search**.
2. Open a listing to see screenshots and the **Live Demo Preview**:
   - **Embedded iframe** — the demo runs right on the page.
   - **External demo link** — click **Launch demo**.
3. Check the price (one-time or `/mo`; blank means **Price on site**).
4. Click **Buy now** — you're taken to the seller's payment portal (Stripe,
   Lemon Squeezy, Gumroad, custom checkout, etc.) and complete the purchase there.
5. You can also visit the demo in a new tab and read the **About** section.

### As a seller — how to upload an app or platform

1. Go to `/studio`.
2. **Sign in** with your email — a magic link is sent to your inbox. Click it and
   you're redirected back to the Studio automatically.
3. Click **New product** and fill in the form:

   - **Basics** — Name, Slug (optional), Tagline, Category, Description.
   - **Demo** —
     - *Demo type:* **Embedded iframe** (runs on the page) or **External demo
       link** (opens elsewhere), or **No demo**.
     - *Demo URL:* where buyers can try the product.
     - *Demo blurb:* a sentence shown next to the demo.
   - **Pricing & purchase** —
     - *Price* (optional), *Currency*, and *Billing* (**One-time** or **Monthly**).
       Leave the price blank to show **Price on site**.
     - *Purchase link:* the URL of your **payment portal** (required) — e.g. a
       Stripe payment link, a Lemon Squeezy / Gumroad checkout, or your own
       `/checkout` page. This is where the **Buy now** button sends people.
   - **Screenshots** — click **Add**, select one or more images. They upload to
     Supabase Storage automatically.

4. Tick **Publish (visible on marketplace)** when you're ready, then click
   **Create product**.
5. Manage everything from the Studio dashboard — **edit**, **publish/unpublish**,
   **view the live listing**, or **delete**. You only ever see and manage your
   own listings.

> **Demo tip:** an embedded iframe only works on sites that don't block being
> framed (no `X-Frame-Options`/CSP header). If your app refuses to embed, switch
> the demo type to **External demo link**.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
2. Import your GitHub repo. Vercel auto-detects Next.js — no build settings needed.
3. Under **Environment Variables**, add **Production** values for every variable
   in `.env.local.example`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   DATABASE_URL
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   CRON_SECRET=<random string>
   ```

4. Click **Deploy**.

### 3. Apply the database schema

If you already ran `npx drizzle-kit migrate` locally against the same Supabase
project, the schema is already there and you're done. If you're using a separate
production database, run the migration against **its** `DATABASE_URL`
(`drizzle-kit` reads a `.env` file, not `.env.local`):

```bash
DATABASE_URL="postgresql://postgres:...@db.PROJECT.supabase.co:5432/postgres" npx drizzle-kit migrate
```

### 4. Add the production auth redirect

In Supabase → **Authentication → URL Configuration → Redirect URLs**, add your
production callback:

```
https://your-app.vercel.app/auth/callback
```

### 5. Keep the free-tier database awake (optional)

`vercel.json` already defines a daily cron job that pings `/api/cron/keepalive`
so the free-tier Supabase Postgres compute never auto-pauses. You can point any
uptime monitor (e.g. UptimeRobot) at that endpoint too. If `CRON_SECRET` is set,
callers must send `Authorization: Bearer <CRON_SECRET>`.

### 6. Re-deploy & verify

Vercel redeploys automatically on every push. Verify the production site by:

1. Opening the marketplace at your Vercel URL.
2. Signing in at `/studio` (make sure the magic-link email opens on the
   production domain).
3. Uploading a test product with a demo, price, and purchase link, publishing it,
   and confirming it appears on the home page with a working **Buy now** button.

---

## Project structure

```
src/
  app/
    page.tsx                  # Marketplace grid + search/filter
    product/[slug]/page.tsx   # Product detail: demo, price, buy CTA
    studio/page.tsx           # Studio: sign-in gate + seller dashboard
    api/products/             # GET (public) / POST (auth) product routes
    api/products/[slug]/      # PATCH / DELETE — owner only
    api/upload/               # Signed screenshot upload (auth)
    api/cron/keepalive/       # DB keep-alive ping for Vercel cron
    auth/callback/            # Magic-link session exchange
  components/                 # Header, ProductCard, StudioForm, gallery, …
  lib/
    db/schema.ts              # Drizzle schema (products, purchases)
    db/index.ts               # Lazy Postgres + Drizzle client
    products.ts               # Product queries + mutations
    format.ts                 # Price/currency formatting helpers
    auth.ts                   # getSessionUser() helper
    supabase/                 # Server + browser Supabase clients
  proxy.ts                    # Session-refresh middleware
drizzle/                      # SQL migrations
```

## Payment-ready schema

`products` already carries `price_cents`, `currency`, `billing_interval`, and
`stripe_product_id`, plus a stub `purchases` table. Adding Stripe/Lemon Squeezy
checkout in-app later is additive — no migration rewrite required.
