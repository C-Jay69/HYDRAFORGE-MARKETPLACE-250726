// Shared domain types for the HYDRAFORGE marketplace.

export const PRODUCT_CATEGORIES = [
  "ecommerce",
  "dating",
  "resume-builder",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUSES = ["draft", "published"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const DEMO_TYPES = ["none", "iframe", "link"] as const;
export type DemoType = (typeof DEMO_TYPES)[number];

export const BILLING_INTERVALS = ["once", "month"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProductCategory;
  screenshots: string[]; // Supabase Storage public URLs
  demo_blurb: string; // placeholder describing the demo
  demo_url: string | null; // optional URL where the product can be tried
  demo_type: DemoType; // how to render the demo: 'none' | 'iframe' | 'link'
  external_url: string; // link to the live app
  status: ProductStatus;
  owner_id: string | null;
  // Payment-ready (nullable now; filled when checkout is added)
  price_cents: number | null;
  currency: string | null;
  billing_interval: BillingInterval | null;
  stripe_product_id: string | null;
  created_at: string;
  updated_at: string;
}

// Shape used when creating/updating from the Studio form (no server fields).
export type ProductInput = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "owner_id" | "status"
> & {
  status?: ProductStatus;
};

export interface Purchase {
  id: string;
  product_id: string;
  user_id: string;
  amount_cents: number;
  status: "pending" | "paid" | "refunded";
  created_at: string;
}
