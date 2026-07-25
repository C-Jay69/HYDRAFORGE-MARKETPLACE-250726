CREATE TYPE "public"."billing_interval" AS ENUM('once', 'month');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('ecommerce', 'dating', 'resume-builder', 'other');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" "product_category" DEFAULT 'other' NOT NULL,
	"screenshots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"demo_blurb" text DEFAULT '' NOT NULL,
	"external_url" text NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"owner_id" uuid,
	"price_cents" integer,
	"currency" text,
	"billing_interval" "billing_interval",
	"stripe_product_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;