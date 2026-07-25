import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, deleteProduct } from "@/lib/products";
import { getSessionUser } from "@/lib/auth";

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
