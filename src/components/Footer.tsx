import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          <span className="font-semibold text-slate-300">HYDRAFORGE</span> — a
          showcase of production SaaS built by Simon.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-cyan-400">
            Marketplace
          </Link>
          <Link href="/studio" className="hover:text-cyan-400">
            Studio
          </Link>
        </div>
      </div>
    </footer>
  );
}
