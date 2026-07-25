import Link from "next/link";
import { ArrowUpRight, Image as ImageIcon } from "lucide-react";
import type { Product, ProductCategory } from "@/types";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ecommerce: "E-commerce",
  dating: "Dating",
  "resume-builder": "Resume Builder",
  other: "Other",
};

export function ProductCard({ product }: { product: Product }) {
  const thumb = product.screenshots[0];
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg"
    >
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
        <span className="absolute left-3 top-3 rounded-full border border-cyan-800/60 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-cyan-300 backdrop-blur">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-500 transition-colors group-hover:text-cyan-400" />
        </div>
        <p className="line-clamp-2 text-sm text-slate-400">{product.tagline}</p>
        <span className="mt-auto inline-flex w-fit items-center gap-1 pt-2 text-sm font-medium text-cyan-400">
          View demo
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
