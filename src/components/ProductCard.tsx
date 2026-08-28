import Link from "next/link";
import { ArrowUpRight, Image as ImageIcon, Play } from "lucide-react";
import type { Product } from "@/types";
import { priceLabel } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/categories";

export function ProductCard({ product }: { product: Product }) {
  const thumb = product.screenshots[0];
  const price = priceLabel(
    product.price_cents,
    product.currency,
    product.billing_interval
  );
  const hasDemo = product.demo_type !== "none" && !!product.demo_url?.trim();
  const localDemo = hasDemo && product.demo_url!.startsWith("/");

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg">
      {/* Stretched link to the product detail page (keeps the whole card clickable) */}
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${product.name}`}
      />

      <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={`${product.name} screenshot`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <span className="absolute left-3 top-3 z-20 rounded-full border border-cyan-800/60 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-cyan-300 backdrop-blur">
          {CATEGORY_LABELS[product.category]}
        </span>
        {hasDemo && (
          <span className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border border-emerald-800/60 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-emerald-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live demo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-500 transition-colors group-hover:text-cyan-400" />
        </div>
        <p className="line-clamp-2 text-sm text-slate-400">{product.tagline}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          {localDemo ? (
            <Link
              href={product.demo_url!}
              className="relative z-20 inline-flex w-fit items-center gap-1 text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              <Play className="h-4 w-4" /> Launch demo
            </Link>
          ) : (
            <span className="inline-flex w-fit items-center gap-1 text-sm font-medium text-cyan-400">
              View demo
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
          {price && (
            <span className="text-sm font-semibold text-emerald-300">{price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
