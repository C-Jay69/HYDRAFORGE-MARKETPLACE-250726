import { listProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Cpu, Plus } from "lucide-react";
import Link from "next/link";

// Force dynamic so the marketplace always reflects the latest published products.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const products = await listProducts({
    category: (category as never) ?? "all",
    q: q ?? "",
  });

  return (
    <div className="relative">
      {/* Hero */}
      <section className="glow-radial bg-grid">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="h-5 w-5" />
            <span className="font-mono text-xs uppercase tracking-widest">
              The Forge Collection
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Production SaaS,
            <span className="text-cyan-400"> forged, demoed and for sale.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-400">
            A marketplace of real, shipping products — e-commerce, dating,
            resume builders and more. Try the live demos, then buy directly
            through each seller&apos;s payment portal.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-700/50 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20"
            >
              <Plus className="h-4 w-4" />
              Sell your app
            </Link>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              Sign up to list your product with a live demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Browse */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CategoryFilter
          initialCategory={category ?? "all"}
          initialQuery={q ?? ""}
          total={products.length}
        />

        {products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-20 text-center">
            <p className="text-lg font-medium text-slate-300">
              No products published yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Head to the Studio to upload your first SaaS.
            </p>
            <Link
              href="/studio"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              <Plus className="h-4 w-4" /> Open Studio
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
