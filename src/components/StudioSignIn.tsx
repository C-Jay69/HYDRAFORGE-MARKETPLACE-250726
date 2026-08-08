"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, LogIn, UserPlus } from "lucide-react";

type PasswordMode = "signin" | "signup";

export function StudioSignIn() {
  const router = useRouter();
  const [method, setMethod] = useState<"password" | "magiclink">("password");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sentTitle, setSentTitle] = useState("");
  const [sentBody, setSentBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteUrl =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin)
      : "";

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
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
      setSentTitle("Magic link sent");
      setSentBody(
        `Check ${email} for your sign-in link. Click it and you'll be signed in automatically.`
      );
    }
  }

  async function signInWithGoogle() {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/studio`,
      },
    });
    if (error) {
      setGoogleLoading(false);
      setError(error.message);
    }
    // On success the browser is redirected to Google, so no cleanup needed.
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    if (passwordMode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/studio");
      router.refresh();
      return;
    }

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/studio`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/studio");
      router.refresh();
    } else {
      setLoading(false);
      setSentTitle("Confirm your email");
      setSentBody(
        `We sent a confirmation link to ${email}. Click it to activate your account, then sign in.`
      );
    }
  }

  if (sentTitle) {
    return (
      <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/30 px-5 py-6 text-center">
        <Mail className="mx-auto h-8 w-8 text-cyan-400" />
        <p className="mt-3 text-sm font-medium text-slate-200">{sentTitle}</p>
        <p className="mt-1 text-sm text-slate-400">{sentBody}</p>
        <button
          type="button"
          onClick={() => {
            setSentTitle("");
            setSentBody("");
            setLoading(false);
          }}
          className="mt-4 inline-block text-sm text-slate-400 hover:text-cyan-400"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={googleLoading}
        className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 py-1 text-xs text-slate-500">
        <span className="h-px flex-1 bg-slate-800" />
        or continue with email
        <span className="h-px flex-1 bg-slate-800" />
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1">
        <button
          type="button"
          onClick={() => setMethod("password")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            method === "password"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Email &amp; password
        </button>
        <button
          type="button"
          onClick={() => setMethod("magiclink")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            method === "magiclink"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Magic link
        </button>
      </div>

      {method === "password" ? (
        <form onSubmit={submitPassword} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-60"
          >
            {passwordMode === "signin" ? (
              <>
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in…" : "Sign in"}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating account…" : "Create account"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              setPasswordMode((m) => (m === "signin" ? "signup" : "signin"))
            }
            className="text-sm text-slate-400 hover:text-cyan-400"
          >
            {passwordMode === "signin"
              ? "Don't have an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      ) : (
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
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.603 32.054 29.223 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
