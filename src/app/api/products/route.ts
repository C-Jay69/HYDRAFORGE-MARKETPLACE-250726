import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  listProducts,
  createProduct,
} from "@/lib/products";
import { PRODUCT_CATEGORIES } from "@/types";

// GET /api/products?category=ecommerce&q=search
// Public: returns PUBLISHED products only.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "all";
  const q = searchParams.get("q") ?? "";

  const validCategory =
    category === "all" || (PRODUCT_CATEGORIES as readonly string[]).includes(category)
      ? category
      : "all";

  const items = await listProducts({ category: validCategory as never, q });
  return NextResponse.json({ products: items, count: items.length });
}

// POST /api/products  — requires auth (Studio owner only)
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Required field validation
  const required = ["name", "tagline", "external_url", "category"];
  for (const field of required) {
    if (typeof b[field] !== "string" || !(b[field] as string).trim()) {
      return NextResponse.json(
        { error: `Field '${field}' is required and must be a non-empty string.` },
        { status: 400 }
      );
    }
  }

  if (
    !PRODUCT_CATEGORIES.includes(b.category as never) &&
    b.category !== "other"
  ) {
    return NextResponse.json(
      { error: "Invalid category." },
      { status: 400 }
    );
  }

  // Basic URL sanity check
  try {
    new URL(b.external_url as string);
  } catch {
    return NextResponse.json(
      { error: "external_url must be a valid URL." },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(
      {
        slug: typeof b.slug === "string" ? b.slug : "",
        name: b.name as string,
        tagline: b.tagline as string,
        description: typeof b.description === "string" ? b.description : "",
        category: b.category as never,
        screenshots: Array.isArray(b.screenshots) ? (b.screenshots as string[]) : [],
        demo_blurb: typeof b.demo_blurb === "string" ? b.demo_blurb : "",
        external_url: b.external_url as string,
        status: b.status === "published" ? "published" : "draft",
        price_cents: typeof b.price_cents === "number" ? b.price_cents : null,
        currency: typeof b.currency === "string" ? b.currency : null,
        billing_interval:
          b.billing_interval === "once" || b.billing_interval === "month"
            ? b.billing_interval
            : null,
        stripe_product_id: null,
      },
      user.id
    );
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("createProduct failed:", err);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
