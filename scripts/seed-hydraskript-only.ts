// Focused, idempotent upload of ONLY the HydraSkript listing to the
// HYDRAFORGE marketplace (the canonical seed-apps.ts uploads all five flagships).
// Run:  bun run scripts/seed-hydraskript-only.ts
// Requires DATABASE_URL in .env.local (the marketplace's Supabase).

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const HYDRASKRIPT = {
  slug: "hydraskript",
  name: "HydraSkript",
  tagline: "AI co-authoring studio — turn an idea into a finished book.",
  description:
    "Full-stack AI publishing platform for authors: structured outlining, chapter-by-chapter AI approval, illustration generation, multi-format export, and audiobook generation.",
  category: "publishing" as const,
  demoBlurb: "Write a book from outline to audiobook with the AI co-author.",
  demoUrl: "https://hydraskript.com",
  demoType: "link" as const,
  demoCredentials: "demo@hydraforge.tech / demo1234",
  externalUrl: "https://hydraskript.com",
  screenshots: [
    "/screenshots/hydraskript-demo1.png",
    "/screenshots/hydraskript-screenshot1.png",
    "/screenshots/hydraskript-screenshot2.png",
  ],
};

async function main() {
  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, HYDRASKRIPT.slug))
    .limit(1);

  if (existing) {
    console.log("skip  hydraskript (already exists)");
    process.exit(0);
  }

  await db.insert(products).values({
    ...HYDRASKRIPT,
    status: "published",
    ownerId: null,
  });

  console.log("seed  hydraskript → HydraSkript");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
