import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

// Enums ------------------------------------------------------------
export const categoryEnum = pgEnum("product_category", [
  "ecommerce",
  "dating",
  "resume-builder",
  "other",
]);

export const statusEnum = pgEnum("product_status", ["draft", "published"]);

export const billingIntervalEnum = pgEnum("billing_interval", [
  "once",
  "month",
]);

export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "paid",
  "refunded",
]);

// Products ---------------------------------------------------------
// Payment-related columns are nullable NOW so the checkout feature can be
// bolted on later without a schema rewrite.
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull().default(""),
  category: categoryEnum("category").notNull().default("other"),
  screenshots: jsonb("screenshots").$type<string[]>().notNull().default([]),
  demoBlurb: text("demo_blurb").notNull().default(""),
  externalUrl: text("external_url").notNull(),
  status: statusEnum("status").notNull().default("draft"),
  ownerId: uuid("owner_id"),
  priceCents: integer("price_cents"),
  currency: text("currency"),
  billingInterval: billingIntervalEnum("billing_interval"),
  stripeProductId: text("stripe_product_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Purchases (stub — unused until payments are implemented) ----------
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  amountCents: integer("amount_cents").notNull().default(0),
  status: purchaseStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type PurchaseRow = typeof purchases.$inferSelect;
