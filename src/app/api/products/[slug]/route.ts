import { NextRequest, NextResponse } from "next/server";
import {
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { getSessionUser } from "@/lib/auth";
import type { ProductInput } from "@/types";
import { PRODUCT_CATEGORIES, DEMO_TYPES, BILLING_INTERVALS } from "@/types";

const VALID_CATEGORIES = PRODUCT_CATEGORIES as readonly string[];
const VALID_DEMO_TYPES = DEMO_TYPES as readonly string[];
const VALID_BILLING = BILLING_INTERVALS as readonly string[];

// PATCH /api/products/[slug] — owner only. Accepts any editable field.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (product.owner_id && product.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Partial<ProductInput> = {};

  const stringField = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string) : undefined;

  const name = stringField("name");
  if (name !== undefined) {
    if (!name.trim()) {
      return NextResponse.json(
        { error: "Field 'name' must be a non-empty string." },
        { status: 400 }
      );
    }
    patch.name = name;
  }

  const slugVal = stringField("slug");
  if (slugVal !== undefined) patch.slug = slugVal;

  const tagline = stringField("tagline");
  if (tagline !== undefined) {
    if (!tagline.trim()) {
      return NextResponse.json(
        { error: "Field 'tagline' must be a non-empty string." },
        { status: 400 }
      );
    }
    patch.tagline = tagline;
  }

  const description = stringField("description");
  if (description !== undefined) patch.description = description;

  if (body.category !== undefined) {
    if (!VALID_CATEGORIES.includes(body.category as string)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    patch.category = body.category as never;
  }

  if (Array.isArray(body.screenshots)) patch.screenshots = body.screenshots;

  const demoBlurb = stringField("demo_blurb");
  if (demoBlurb !== undefined) patch.demo_blurb = demoBlurb;

  if (body.demo_type !== undefined) {
    if (!VALID_DEMO_TYPES.includes(body.demo_type as string)) {
      return NextResponse.json(
        { error: "Invalid demo_type." },
        { status: 400 }
      );
    }
    patch.demo_type = body.demo_type as never;
  }

  const demoUrl = stringField("demo_url");
  if (demoUrl !== undefined) {
    if (demoUrl.trim() && !isValidUrl(demoUrl)) {
      return NextResponse.json(
        { error: "demo_url must be a valid URL." },
        { status: 400 }
      );
    }
    patch.demo_url = demoUrl.trim() ? demoUrl : null;
  }

  const demoCredentials = stringField("demo_credentials");
  if (demoCredentials !== undefined) {
    patch.demo_credentials = demoCredentials.trim() ? demoCredentials : null;
  }

  const externalUrl = stringField("external_url");
  if (externalUrl !== undefined) {
    if (!externalUrl.trim() || !isValidUrl(externalUrl)) {
      return NextResponse.json(
        { error: "external_url must be a valid URL." },
        { status: 400 }
      );
    }
    patch.external_url = externalUrl;
  }

  if (body.status !== undefined) {
    if (body.status !== "published" && body.status !== "draft") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status as never;
  }

  if (body.price_cents !== undefined) {
    if (
      body.price_cents !== null &&
      (typeof body.price_cents !== "number" ||
        !Number.isInteger(body.price_cents) ||
        body.price_cents < 0)
    ) {
      return NextResponse.json(
        { error: "price_cents must be a non-negative integer or null." },
        { status: 400 }
      );
    }
    patch.price_cents = body.price_cents as number | null;
  }

  const currency = stringField("currency");
  if (currency !== undefined) patch.currency = currency || null;

  if (body.billing_interval !== undefined) {
    if (
      body.billing_interval !== null &&
      !VALID_BILLING.includes(body.billing_interval as string)
    ) {
      return NextResponse.json(
        { error: "Invalid billing_interval." },
        { status: 400 }
      );
    }
    patch.billing_interval = body.billing_interval as never;
  }

  try {
    const updated = await updateProduct(product.id, patch);
    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error("updateProduct failed:", err);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[slug] — owner only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (product.owner_id && product.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await deleteProduct(product.id);
  return NextResponse.json({ ok: true });
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
