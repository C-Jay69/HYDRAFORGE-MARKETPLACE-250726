// Simulated "AI co-authoring" engine for the HydraSkript demo.
// Fully client-side — no network calls. Deterministic per-input so the demo
// feels coherent while staying self-contained.

export interface Chapter {
  title: string;
  summary: string;
  goal: string;
  draft: string;
  approved: boolean;
}

export interface Outline {
  title: string;
  subtitle: string;
  premise: string;
  kind: "fiction" | "nonfiction";
  chapters: Chapter[];
}

export type CoverPalette = {
  id: string;
  name: string;
  from: string;
  to: string;
  ink: string;
  accent: string;
};

export const COVER_PALETTES: CoverPalette[] = [
  { id: "abyss", name: "Abyss", from: "#0ea5e9", to: "#1e1b4b", ink: "#e0f2fe", accent: "#22d3ee" },
  { id: "ember", name: "Ember", from: "#f97316", to: "#4c0519", ink: "#fff7ed", accent: "#fb923c" },
  { id: "verdant", name: "Verdant", from: "#10b981", to: "#022c22", ink: "#ecfdf5", accent: "#34d399" },
  { id: "amethyst", name: "Amethyst", from: "#a855f7", to: "#1e1b4b", ink: "#f5f3ff", accent: "#c084fc" },
  { id: "mono", name: "Noir", from: "#334155", to: "#020617", ink: "#f1f5f9", accent: "#94a3b8" },
];

// ---- small deterministic helpers -------------------------------------

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function titleCase(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function wordWrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ---- outline generation ----------------------------------------------

const FICTION_ARCHETYPES = [
  "The Ordinary World",
  "The Call to Adventure",
  "Crossing the Threshold",
  "Trials and Allies",
  "The Descent",
  "The Turning Point",
  "The Climax",
  "The Return",
];

const NONFICTION_ARCHETYPES = [
  "Foundations",
  "The Core Framework",
  "Methods That Work",
  "Case Studies",
  "Common Pitfalls",
  "Your Playbook",
  "What Comes Next",
];

const NONFICTION_HINTS = [
  "guide",
  "how to",
  "manual",
  "course",
  "handbook",
  "playbook",
  "book about",
  "step-by-step",
  "for beginners",
  "master",
];

function detectKind(idea: string): "fiction" | "nonfiction" {
  const lower = idea.toLowerCase();
  if (NONFICTION_HINTS.some((h) => lower.includes(h))) return "nonfiction";
  return "fiction";
}

function deriveTitle(idea: string): { title: string; subtitle: string } {
  const clean = idea.trim().replace(/\.$/, "");
  const seed = hash(clean);
  if (clean.length <= 4) {
    return { title: titleCase(clean || "Untitled"), subtitle: "A HydraSkript draft" };
  }
  // Use the first sentence-ish fragment as the title seed.
  const fragment = clean.split(/[.;:—-]/)[0].trim();
  const titleBase =
    fragment.length > 60 ? fragment.slice(0, 57).trim() + "…" : fragment;
  const subtitles = [
    "A tale forged chapter by chapter",
    "The complete co-authored edition",
    "An AI-assisted original",
    "Outlined, written & narrated with HydraSkript",
    "From spark to finished book",
  ];
  return { title: titleCase(titleBase), subtitle: pick(subtitles, seed) };
}

function chapterSummary(kind: Outline["kind"], title: string, idea: string, i: number): string {
  const seed = hash(title + i);
  if (kind === "nonfiction") {
    const opts = [
      `Lays out the key ideas behind "${title.toLowerCase()}" and why they matter for ${idea.slice(0, 40)}.`,
      `Gives the reader a repeatable method for ${title.toLowerCase()}, with concrete examples.`,
      `Breaks down ${title.toLowerCase()} into steps you can apply today.`,
      `Stress-tests the assumptions in ${idea.slice(0, 40)} and shows what actually works.`,
    ];
    return pick(opts, seed);
  }
  const opts = [
    `Introduces "${title}" and shifts the stakes of the story forward.`,
    `Deepens the world established by the premise of ${idea.slice(0, 40)}.`,
    `Puts the protagonist to the test and raises the central tension.`,
    `Reveals what is truly at risk as the narrative turns.`,
  ];
  return pick(opts, seed);
}

function chapterGoal(kind: Outline["kind"], title: string): string {
  if (kind === "nonfiction") return `Reader finishes "${title}" with a clear, usable takeaway.`;
  return `Advance the plot through "${title}" while raising emotional stakes.`;
}

export function generateOutline(rawIdea: string): Outline {
  const idea = rawIdea.trim() || "A story about a quiet hero who changes everything.";
  const kind = detectKind(idea);
  const { title, subtitle } = deriveTitle(idea);
  const seed = hash(idea);

  const archetypes = kind === "nonfiction" ? NONFICTION_ARCHETYPES : FICTION_ARCHETYPES;
  const count = 6 + (seed % 3); // 6–8 chapters
  const chapters: Chapter[] = [];
  for (let i = 0; i < count; i++) {
    const chTitle = pick(archetypes, seed + i * 7);
    chapters.push({
      title: chTitle,
      summary: chapterSummary(kind, chTitle, idea, i),
      goal: chapterGoal(kind, chTitle),
      draft: "",
      approved: false,
    });
  }

  const premise =
    kind === "nonfiction"
      ? `${title} is a practical guide born from a simple idea: ${idea} In the pages that follow, HydraSkript helps you move from that idea to a structured, finished book — outline first, then chapter-by-chapter co-authoring, illustration, and finally a narrated audiobook.`
      : `${title} begins with a single premise: ${idea} Across ${count} chapters, the narrative is outlined, drafted, illustrated, and narrated with the help of your AI co-author.`;

  return { title, subtitle, premise, kind, chapters };
}

// ---- chapter drafting ------------------------------------------------

export function generateChapterDraft(idea: string, ch: Chapter, idx: number, total: number, kind: Outline["kind"]): string {
  const base = kind === "nonfiction"
    ? [
        `In this chapter we turn the idea — "${idea.slice(0, 70)}" — into something actionable. The goal is not theory for its own sake, but a method you can use immediately.`,
        `Start with the constraint that matters most. ${ch.summary} By naming it plainly, the rest of the work becomes a series of small, reversible steps rather than one overwhelming leap.`,
        `A useful pattern here is to prototype early: ship a rough version, watch what resonates, and refine. ${pick(["Measurement beats intuition.", "Momentum beats perfection.", "Clarity beats cleverness."], hash(ch.title + idx))} Applied to "${ch.title.toLowerCase()}", the chapter earns its place in the book.`,
        `Before moving on, capture one decision you can act on this week. That single commitment is what separates a book you read from a book you use.`,
      ]
    : [
        `The chapter opens on ${ch.title.toLowerCase()}. ${ch.summary} The air feels charged, as if the world itself is holding its breath.`,
        `Our protagonist carries the weight of the premise — ${idea.slice(0, 70)} — into unfamiliar ground. Every choice here tightens the thread between who they were and who they are becoming.`,
        `${pick(["A small kindness surprises them.", "A door that should be locked stands ajar.", "An old promise returns to haunt the present."], hash(ch.title + idx))} It is the kind of moment that reshapes the story without anyone quite noticing yet.`,
        `By the final beat, the stakes have shifted. Chapter ${idx + 1} of ${total} closes not with an answer but with a sharper question — and the reader turns the page.`,
      ];
  return base.join("\n\n");
}

// ---- cover illustration (SVG) ----------------------------------------

export function generateCoverSvg(outline: Outline, palette: CoverPalette): string {
  const w = 600;
  const h = 800;
  const titleLines = wordWrap(outline.title, 16).slice(0, 4);
  const subLines = wordWrap(outline.subtitle, 26).slice(0, 2);

  // decorative motif circles seeded by title
  const blobs = Array.from({ length: 5 }, (_, i) => {
    const s = hash(outline.title + i);
    const cx = 60 + (s % 480);
    const cy = 80 + ((s >> 3) % 640);
    const r = 30 + ((s >> 5) % 90);
    const op = 0.06 + ((s >> 7) % 12) / 100;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.accent}" opacity="${op.toFixed(2)}" />`;
  }).join("");

  const titleSvg = titleLines
    .map(
      (l, i) =>
        `<text x="60" y="${300 + i * 52}" font-family="Georgia, serif" font-size="44" font-weight="700" fill="${palette.ink}">${escapeXml(l)}</text>`
    )
    .join("");

  const subSvg = subLines
    .map(
      (l, i) =>
        `<text x="62" y="${330 + titleLines.length * 52 + i * 30}" font-family="Georgia, serif" font-size="20" fill="${palette.ink}" opacity="0.8">${escapeXml(l)}</text>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  ${blobs}
  <rect x="42" y="250" width="6" height="${40 + titleLines.length * 52}" fill="${palette.accent}" />
  ${titleSvg}
  ${subSvg}
  <text x="60" y="${h - 60}" font-family="monospace" font-size="14" letter-spacing="3" fill="${palette.ink}" opacity="0.7">HYDRASKRIPT · AI CO-AUTHORED</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ---- chapter spot illustration (small motif) -------------------------

export function generateChapterArt(ch: Chapter, palette: CoverPalette, idx: number): string {
  const w = 320;
  const h = 200;
  const shapes = Array.from({ length: 4 }, (_, i) => {
    const s = hash(ch.title + i + "art");
    const x = 20 + ((s >> 2) % 260);
    const y = 20 + ((s >> 4) % 140);
    const r = 14 + ((s >> 6) % 40);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${palette.accent}" opacity="0.18" />`;
  }).join("");
  const label = wordWrap(ch.title, 22).slice(0, 2).map((l, i) =>
    `<text x="20" y="${150 + i * 24}" font-family="Georgia, serif" font-size="20" font-weight="700" fill="${palette.ink}">${escapeXml(l)}</text>`
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="cg${idx}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.from}" /><stop offset="100%" stop-color="${palette.to}" />
    </linearGradient></defs>
    <rect width="${w}" height="${h}" rx="14" fill="url(#cg${idx})" />
    ${shapes}
    ${label}
  </svg>`;
}

// ---- exports ----------------------------------------------------------

export function buildMarkdown(o: Outline): string {
  const head = `# ${o.title}\n\n> ${o.subtitle}\n\n${o.premise}\n`;
  const body = o.chapters
    .map((c, i) => {
      const draft = c.draft.trim() || `_(Draft pending — co-author this chapter in HydraSkript.)_`;
      return `## Chapter ${i + 1}: ${c.title}\n\n${c.summary}\n\n${draft}\n`;
    })
    .join("\n");
  return `${head}\n---\n\n${body}\n\n*Generated with HydraSkript — AI co-authoring studio.*\n`;
}

export function buildPlain(o: Outline): string {
  const head = `${o.title}\n${o.subtitle}\n\n${o.premise}\n`;
  const body = o.chapters
    .map((c, i) => {
      const draft = c.draft.trim() || `[Draft pending — co-author this chapter in HydraSkript.]`;
      return `Chapter ${i + 1}: ${c.title}\n\n${c.summary}\n\n${draft}\n`;
    })
    .join("\n");
  return `${head}\n${"=".repeat(40)}\n\n${body}\n\nGenerated with HydraSkript.\n`;
}

export function buildJson(o: Outline): string {
  return JSON.stringify(
    {
      title: o.title,
      subtitle: o.subtitle,
      premise: o.premise,
      kind: o.kind,
      generatedWith: "HydraSkript",
      chapters: o.chapters.map((c, i) => ({
        number: i + 1,
        title: c.title,
        summary: c.summary,
        goal: c.goal,
        approved: c.approved,
        draft: c.draft,
      })),
    },
    null,
    2
  );
}

export function wordCount(o: Outline): number {
  const text = buildPlain(o);
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
