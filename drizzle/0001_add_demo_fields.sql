CREATE TYPE "public"."demo_type" AS ENUM('none', 'iframe', 'link');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "demo_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "demo_type" "demo_type" DEFAULT 'none' NOT NULL;