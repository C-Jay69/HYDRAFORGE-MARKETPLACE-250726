import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { getProductBySlug } from "@/lib/products";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: "E-commerce",
  dating: "Dating",
  "resume-builder": "Resume Builder",
  other: "Other",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "published") notFound();

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
          <span className="w-fit rounded-full border border-cyan-800/60 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white">{product.name}</h1>
          <p className="mt-2 text-lg text-slate-300">{product.tagline}</p>

          {/* Demo placeholder block */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Live Demo Preview
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {product.demo_blurb ||
                "A quick look at the product. Open the live app to explore the full experience."}
            </p>
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

          <a
            href={product.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            Visit live app
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
