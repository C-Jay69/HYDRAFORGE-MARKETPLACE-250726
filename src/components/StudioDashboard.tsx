"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  LogOut,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import { priceLabel } from "@/lib/format";
import { StudioForm } from "./StudioForm";

export function StudioDashboard({
  products,
  email,
}: {
  products: Product[];
  email: string | null;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/studio");
    router.refresh();
  }

  async function togglePublish(p: Product) {
    setBusy(p.id);
    const next = p.status === "published" ? "draft" : "published";
    await fetch(`/api/products/${p.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setBusy(p.id);
    await fetch(`/api/products/${p.slug}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Studio</h1>
          <p className="text-sm text-slate-400">{email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm((s) => !s);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" /> New product
          </button>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-600 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <StudioForm
            product={editing}
            onDone={() => {
              setShowForm(false);
              setEditing(null);
              router.refresh();
            }}
          />
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/60 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No products yet. Click “New product” to add your first.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/30">
                <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                <td className="px-4 py-3 text-slate-400">{p.category}</td>
                <td className="px-4 py-3 text-emerald-300">
                  {priceLabel(p.price_cents, p.currency, p.billing_interval) ??
                    "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      p.status === "published"
                        ? "bg-emerald-950/50 text-emerald-300"
                        : "bg-amber-950/50 text-amber-300"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Toggle publish"
                      disabled={busy === p.id}
                      onClick={() => togglePublish(p)}
                      className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                    >
                      {p.status === "published" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      title="Edit"
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <Link
                      title="View live listing"
                      href={`/product/${p.slug}`}
                      className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      title="Delete"
                      disabled={busy === p.id}
                      onClick={() => remove(p)}
                      className="rounded-lg p-2 text-slate-300 hover:bg-red-900/40 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
