// One-off: point the existing HydraSkript listing at the in-marketplace demo.
// Run:  bun run scripts/set-hydraskript-demo.ts
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const [existing] = await db
    .select({ id: products.id, demoUrl: products.demoUrl, demoType: products.demoType })
    .from(products)
    .where(eq(products.slug, "hydraskript"))
    .limit(1);

  if (!existing) {
    console.log("no hydraskript record found — run the seed first.");
    process.exit(0);
  }

  await db
    .update(products)
    .set({ demoUrl: "/product/hydraskript/demo", demoType: "iframe", updatedAt: new Date() })
    .where(eq(products.slug, "hydraskript"));

  console.log("updated hydraskript demo → /product/hydraskript/demo (iframe)");
  process.exit(0);
}

main().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
