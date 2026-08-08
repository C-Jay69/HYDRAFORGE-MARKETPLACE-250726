ALTER TYPE "public"."product_category" ADD VALUE 'publishing' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."product_category" ADD VALUE 'education' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."product_category" ADD VALUE 'due-diligence' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."product_category" ADD VALUE 'parental-monitoring' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."product_category" ADD VALUE 'social' BEFORE 'other';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "demo_credentials" text;