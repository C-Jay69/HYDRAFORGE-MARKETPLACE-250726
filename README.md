# HYDRAFORGE Marketplace

A SaaS **showcase marketplace**: browse HydraForge987's production SaaS products (e-commerce,
dating, resume builders, …) as live demos with a direct link to each live app.
Free to browse now; the data model is payment-ready so checkout can be added later
without a schema rewrite.

## Stack
- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Supabase** — Postgres (via Drizzle ORM) + Auth (email magic-link) + Storage (screenshots)
- Deploy target: **Vercel**

## Local setup
1. `npm install`
2. Copy `.env.local.example` → `.env.local` and fill in your Supabase values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `DATABASE_URL` (Postgres connection string)
3. `npx drizzle-kit generate && npx drizzle-kit migrate` — create the `products` + `purchases` tables.
4. In Supabase, create a Storage bucket named **`product-screenshots`** (public read, authenticated write).
5. `npm run dev` → http://localhost:3000

## Usage
- **Marketplace** (`/`): public grid, filter by category, search.
- **Product detail** (`/product/[slug]`): demo preview + screenshots + "Visit live app" link.
- **Studio** (`/studio`): sign in with your email (magic link), then create / edit /
  publish / delete your products and upload screenshots.

## Payment-ready schema
`products` already carries nullable `price_cents`, `currency`, `billing_interval`, and
`stripe_product_id`. A stub `purchases` table exists. Adding Stripe checkout later is
additive — no migration rewrite required.
