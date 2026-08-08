"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl bg-white shadow-lg shadow-cyan-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hydraforge-logo.webp"
              alt="HYDRAFORGE logo"
              className="logo-spin h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider text-white">
              HYDRA<span className="text-cyan-400">FORGE</span>
            </span>
            <p className="-mt-1 hidden font-mono text-[10px] text-slate-400 sm:block">
              SaaS SHOWCASE
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Marketplace
          </Link>
          <Link
            href="/studio"
            className="flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-3 py-2 font-medium text-cyan-300 transition-colors hover:bg-cyan-900/60"
          >
            <LayoutDashboard className="h-4 w-4" />
            Studio
          </Link>
        </nav>
      </div>
    </header>
  );
}
