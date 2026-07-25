"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail } from "lucide-react";

export function StudioSignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/studio`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/30 px-5 py-6 text-center">
        <Mail className="mx-auto h-8 w-8 text-cyan-400" />
        <p className="mt-3 text-sm text-slate-200">
          Check <span className="font-semibold text-cyan-300">{email}</span> for
          your sign-in link.
        </p>
        <Link
          href="/studio"
          className="mt-4 inline-block text-sm text-slate-400 hover:text-cyan-400"
        >
          Use a different email
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={sendLink} className="flex flex-col gap-3">
      <label className="text-sm text-slate-300">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-60"
      >
        <Mail className="h-4 w-4" />
        {loading ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
