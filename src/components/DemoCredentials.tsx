"use client";

import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";

// Shows the demo login for a product (e.g. "demo@hydraforge.tech / demo1234")
// with a one-click copy button.
export function DemoCredentials({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. non-secure context) — leave it selectable.
    }
  }

  return (
    <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-cyan-900/60 bg-cyan-950/30 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-cyan-400">
            Demo login
          </p>
          <p className="mt-0.5 select-all break-all font-mono text-xs text-slate-300">
            {value}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-cyan-800/60 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-900/60"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copy
          </>
        )}
      </button>
    </div>
  );
}
