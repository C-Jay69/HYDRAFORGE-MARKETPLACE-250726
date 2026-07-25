"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import type { Product, ProductCategory } from "@/types";

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "dating", label: "Dating" },
  { value: "resume-builder", label: "Resume Builder" },
  { value: "other", label: "Other" },
];

export function StudioForm({
  product,
  onDone,
}: {
  product: Product | null;
  onDone: () => void;
}) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "ecommerce"
  );
  const [demoBlurb, setDemoBlurb] = useState(product?.demo_blurb ?? "");
  const [externalUrl, setExternalUrl] = useState(product?.external_url ?? "");
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [screenshots, setScreenshots] = useState<string[]>(
    product?.screenshots ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        // 1. Ask the server for a signed upload URL.
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });
        if (!res.ok) throw new Error("Upload prepare failed");
        const { uploadUrl, publicUrl } = await res.json();

        // 2. PUT the file directly to Supabase Storage.
        const put = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!put.ok) throw new Error("Upload failed");
        uploaded.push(publicUrl);
      }
      setScreenshots((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError("Screenshot upload failed. Check your connection and retry.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !tagline.trim() || !externalUrl.trim()) {
      setError("Name, tagline and external URL are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        tagline,
        description,
        category,
        demo_blurb: demoBlurb,
        external_url: externalUrl,
        status,
        screenshots,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Resume Builder Pro"
          />
        </Field>
        <Field label="Slug (optional, auto from name)">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputCls}
            placeholder="resume-builder-pro"
          />
        </Field>
        <Field label="Tagline *">
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className={inputCls}
            placeholder="Build a job-winning resume in 5 minutes"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className={inputCls}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value} className="bg-slate-900">
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="External URL (live app) *">
        <input
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          className={inputCls}
          placeholder="https://myapp.com"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputCls}
          placeholder="What does it do? Who is it for?"
        />
      </Field>

      <Field label="Demo blurb (shown on the listing)">
        <textarea
          value={demoBlurb}
          onChange={(e) => setDemoBlurb(e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="A quick look at the product…"
        />
      </Field>

      <Field label="Screenshots">
        <div className="flex flex-wrap gap-3">
          {screenshots.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`screenshot ${i + 1}`}
                className="h-24 w-40 rounded-lg border border-slate-800 object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setScreenshots((prev) => prev.filter((_, j) => j !== i))
                }
                className="absolute -right-2 -top-2 rounded-full bg-slate-800 p-1 text-slate-300 hover:bg-red-900 hover:text-red-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:border-cyan-600 hover:text-cyan-400">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span className="text-xs">{uploading ? "Uploading…" : "Add"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
      </Field>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={status === "published"}
            onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900"
          />
          Publish (visible on marketplace)
        </label>
        <span className="text-xs text-slate-500">
          Payments fields reserved for a future checkout build.
        </span>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : isEdit
            ? "Save changes"
            : "Create product"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-slate-800 px-5 py-3 text-sm text-slate-300 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}
