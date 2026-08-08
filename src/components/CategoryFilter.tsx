"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { CATEGORY_FILTER_OPTIONS } from "@/lib/categories";

export function CategoryFilter({
  initialCategory,
  initialQuery,
  total,
}: {
  initialCategory: string;
  initialQuery: string;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);

  // Push filters into the URL (server re-fetches the filtered list).
  function apply(nextCategory: string, nextQuery: string) {
    const params = new URLSearchParams();
    if (nextCategory && nextCategory !== "all") params.set("category", nextCategory);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  // Debounce search input -> URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== initialQuery || category !== initialCategory) {
        apply(category, query);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_FILTER_OPTIONS.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              setCategory(c.value);
              apply(c.value, query);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c.value
                ? "bg-cyan-500 text-slate-950"
                : "border border-slate-800 bg-slate-900/40 text-slate-300 hover:border-cyan-700/50 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">
          {total} product{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            …
          </span>
        )}
      </div>
    </div>
  );
}
