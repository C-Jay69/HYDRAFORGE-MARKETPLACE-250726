// Seed the demo-hub marketplace with the flagship products.
// Run: bun run scripts/seed-apps.ts
//
// NOTE: demo_url / external_url below are PLACEHOLDERS. Update them to the
// real deployed URLs once each app is live (single platform = one Vercel
// account, one project per app). Rerunning is safe — existing slugs are skipped.

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type SeedApp = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category:
    | "ecommerce"
    | "dating"
    | "resume-builder"
    | "publishing"
    | "education"
    | "due-diligence"
    | "parental-monitoring"
    | "social"
    | "other";
  demoBlurb: string;
  demoUrl: string;
  demoType: "iframe" | "link";
  demoCredentials: string;
  externalUrl: string;
};

const APPS: SeedApp[] = [
  {
    slug: "hydraskript",
    name: "HydraSkript",
    tagline: "AI co-authoring studio — turn an idea into a finished book.",
    description:
      "Full-stack AI publishing platform for authors: structured outlining, chapter-by-chapter AI approval, illustration generation, multi-format export, and audiobook generation.",
    category: "publishing",
    demoBlurb: "Write a book from outline to audiobook with the AI co-author.",
    // NOTE: hydraskript.com must be made live (see Vercel deploy) for this to resolve.
    // If the app blocks iframes, change demoType to "iframe" for an embedded demo.
    demoUrl: "https://hydraskript.com",
    demoType: "link",
    demoCredentials: "demo@hydraforge.tech / demo1234",
    externalUrl: "https://hydraskript.com",
  },
  {
    slug: "relationshit",
    name: "Relationshit",
    tagline: "A couples therapy app disguised as a game.",
    description:
      "Seven game categories of relationship building, a Love Arcade, real-time couple sync, an AI therapist with four levels of sarcasm therapy, and an SOS Fight Solver.",
    category: "dating",
    demoBlurb: "Play a round of couples therapy with Dr. Marcie Liss.",
    demoUrl: "https://relationshit.vercel.app",
    demoType: "link",
    demoCredentials: "demo@hydraforge.tech / demo1234",
    externalUrl: "https://relationshit.vercel.app",
  },
  {
    slug: "hydralearn",
    name: "HydraLearn",
    tagline: "AI-powered educational ecosystem for teachers and students.",
    description:
      "A pedagogical engine (Piaget, Vygotsky, Skinner, Maslow) generates lesson plans, slides, and worksheets. Multi-format quizzes, meme engagement, and full XP/badge gamification.",
    category: "education",
    demoBlurb: "Generate a lesson plan with the pedagogical engine.",
    demoUrl: "https://hydralearn.vercel.app",
    demoType: "link",
    demoCredentials: "demo@hydraforge.tech / demo1234",
    externalUrl: "https://hydralearn.vercel.app",
  },
  {
    slug: "hydraforge-due-diligence",
    name: "Hydraforge DD",
    tagline: "M&A due-diligence and merger risk analysis platform.",
    description:
      "Scoring engine that consumes deal agreements and produces risk analysis for M&A firms. Includes a full M&A legal framework and deal-type-aware reconciliation.",
    category: "due-diligence",
    demoBlurb: "Run a merger risk score against a sample agreement.",
    demoUrl: "https://hydraforge-dd.vercel.app",
    demoType: "link",
    demoCredentials: "demo@hydraforge.tech / demo1234",
    externalUrl: "https://hydraforge-dd.vercel.app",
  },
  {
    slug: "kidsbsafe",
    name: "KIDSbSAFE",
    tagline: "Ethical family safety — protect minors without spyware.",
    description:
      "Transparent protection ecosystem that surfaces only high-risk events to parents. Parent web portal plus native mobile experience, monitoring online grooming and digital hazards.",
    category: "parental-monitoring",
    demoBlurb: "Review the parent dashboard and risk-event feed.",
    demoUrl: "https://kidsbsafe.vercel.app",
    demoType: "link",
    demoCredentials: "demo@hydraforge.tech / demo1234",
    externalUrl: "https://kidsbsafe.vercel.app",
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const app of APPS) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, app.slug))
      .limit(1);

    if (existing) {
      console.log(`skip  ${app.slug} (already exists)`);
      skipped++;
      continue;
    }

    await db.insert(products).values({
      slug: app.slug,
      name: app.name,
      tagline: app.tagline,
      description: app.description,
      category: app.category,
      screenshots: [],
      demoBlurb: app.demoBlurb,
      demoUrl: app.demoUrl,
      demoType: app.demoType,
      demoCredentials: app.demoCredentials,
      externalUrl: app.externalUrl,
      status: "published",
      ownerId: null,
    });

    console.log(`seed  ${app.slug} → ${app.name}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
