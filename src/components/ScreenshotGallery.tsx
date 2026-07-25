"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export function ScreenshotGallery({ screenshots }: { screenshots: string[] }) {
  const [active, setActive] = useState(0);

  if (screenshots.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-600">
        <ImageIcon className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshots[active]}
          alt={`Screenshot ${active + 1}`}
          className="aspect-video w-full object-cover"
        />
      </div>
      {screenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {screenshots.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-28 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                i === active
                  ? "border-cyan-500"
                  : "border-slate-800 opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
