import { db } from "./db";
import { products, type NewProduct, type ProductRow } from "./db/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import type {
  Product,
  ProductInput,
  ProductCategory,
  ProductStatus,
} from "@/types";

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    screenshots: row.screenshots ?? [],
    demo_blurb: row.demoBlurb,
    external_url: row.externalUrl,
    status: row.status,
    owner_id: row.ownerId,
    price_cents: row.priceCents,
    currency: row.currency,
    billing_interval: row.billingInterval,
    stripe_product_id: row.stripeProductId,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export interface ListOptions {
  category?: ProductCategory | "all";
  q?: string;
  includeDrafts?: boolean; // set true for the owner's Studio view
}

// Public browse: published products only, with optional category + search.
export async function listProducts(opts: ListOptions = {}): Promise<Product[]> {
  const conditions = [];
  if (!opts.includeDrafts) {
    conditions.push(eq(products.status, "published"));
  }
  if (opts.category && opts.category !== "all") {
    conditions.push(eq(products.category, opts.category));
  }
  if (opts.q && opts.q.trim()) {
    const term = `%${opts.q.trim()}%`;
    conditions.push(
      or(ilike(products.name, term), ilike(products.tagline, term))
    );
  }

  const rows = await db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(products.createdAt));

  return rows.map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return row ? rowToProduct(row) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return row ? rowToProduct(row) : null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Ensures a unique slug by appending -2, -3, ... if needed.
async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "product";
  let candidate = root;
  let n = 2;
  while (true) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export async function createProduct(
  input: ProductInput,
  ownerId: string | null
): Promise<Product> {
  const slug = await uniqueSlug(input.slug || input.name);
  const payload: NewProduct = {
    slug,
    name: input.name,
    tagline: input.tagline,
    description: input.description,
    category: input.category,
    screenshots: input.screenshots ?? [],
    demoBlurb: input.demo_blurb,
    externalUrl: input.external_url,
    status: input.status ?? "draft",
    ownerId: ownerId ?? null,
    priceCents: input.price_cents ?? null,
    currency: input.currency ?? null,
    billingInterval: input.billing_interval ?? null,
    stripeProductId: input.stripe_product_id ?? null,
  };
  const [row] = await db.insert(products).values(payload).returning();
  return rowToProduct(row);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product | null> {
  const patch: Partial<NewProduct> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.slug !== undefined) patch.slug = slugify(input.slug);
  if (input.tagline !== undefined) patch.tagline = input.tagline;
  if (input.description !== undefined) patch.description = input.description;
  if (input.category !== undefined) patch.category = input.category;
  if (input.screenshots !== undefined) patch.screenshots = input.screenshots;
  if (input.demo_blurb !== undefined) patch.demoBlurb = input.demo_blurb;
  if (input.external_url !== undefined) patch.externalUrl = input.external_url;
  if (input.status !== undefined) patch.status = input.status;
  if (input.price_cents !== undefined) patch.priceCents = input.price_cents;
  if (input.currency !== undefined) patch.currency = input.currency;
  if (input.billing_interval !== undefined)
    patch.billingInterval = input.billing_interval;
  if (input.stripe_product_id !== undefined)
    patch.stripeProductId = input.stripe_product_id;

  const [row] = await db
    .update(products)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(eq(products.id, id))
    .returning();
  return row ? rowToProduct(row) : null;
}

export async function setProductStatus(
  id: string,
  status: ProductStatus
): Promise<void> {
  await db
    .update(products)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(products.id, id));
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}
