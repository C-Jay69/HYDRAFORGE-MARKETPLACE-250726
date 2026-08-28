import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { getProductBySlug } from "@/lib/products";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { DemoCredentials } from "@/components/DemoCredentials";
import { priceLabel } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "published") notFound();

  const price = priceLabel(
    product.price_cents,
    product.currency,
    product.billing_interval
  );
  const hasDemo =
    product.demo_type !== "none" && !!product.demo_url?.trim();
  const demoUrl = product.demo_url ?? "";
  const isLocalDemo = demoUrl.startsWith("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: gallery */}
        <div>
          <ScreenshotGallery screenshots={product.screenshots} />
        </div>

        {/* Right: info + actions */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="w-fit rounded-full border border-cyan-800/60 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>
            {price && (
              <span className="w-fit rounded-full border border-emerald-800/60 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                {price}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-white">{product.name}</h1>
          <p className="mt-2 text-lg text-slate-300">{product.tagline}</p>

          {price && (
            <p className="mt-4 text-2xl font-bold text-white">{price}</p>
          )}

          {/* Buy CTA — links to the seller's payment portal */}
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={product.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {price ? `Buy now — ${price}` : "Buy now"}
              <ExternalLink className="h-5 w-5" />
            </a>
            <p className="text-center text-xs text-slate-500">
              Purchases are completed on the seller&apos;s payment portal.
            </p>
          </div>

          {/* Demo */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Live Demo Preview
              </span>
            </div>
            {product.demo_blurb && (
              <p className="mt-2 text-sm text-slate-400">{product.demo_blurb}</p>
            )}

            {product.demo_credentials && (
              <DemoCredentials value={product.demo_credentials} />
            )}

            {hasDemo && product.demo_type === "iframe" && (
              <div className="mt-4">
                <iframe
                  src={demoUrl}
                  title={`${product.name} live demo`}
                  className={`w-full rounded-xl border border-slate-800 bg-slate-950 ${
                    isLocalDemo ? "h-[720px]" : "h-[420px] bg-white"
                  }`}
                  loading="lazy"
                />
                <a
                  href={demoUrl}
                  target={isLocalDemo ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Open demo in new tab <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {hasDemo && product.demo_type === "link" && (
              <div className="mt-4">
                <a
                  href={demoUrl}
                  target={isLocalDemo ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-4 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-900/60"
                >
                  Launch demo <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {!hasDemo && (
              <p className="mt-2 text-sm text-slate-500">
                No live demo available — head to the product site to explore it.
              </p>
            )}
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                About
              </h2>
              <p className="mt-2 whitespace-pre-line text-slate-300">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
