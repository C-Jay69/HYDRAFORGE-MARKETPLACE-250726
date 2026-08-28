"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ListTree,
  PenLine,
  Image as ImageIcon,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  Play,
  Square,
  Download,
  Loader2,
  Wand2,
} from "lucide-react";

import {
  type Outline,
  type CoverPalette,
  COVER_PALETTES,
  generateOutline,
  generateChapterDraft,
  generateCoverSvg,
  generateChapterArt,
  buildMarkdown,
  buildPlain,
  buildJson,
  wordCount,
  downloadFile,
} from "@/lib/hydraskript";

const STEPS = [
  { icon: Sparkles, label: "Idea" },
  { icon: ListTree, label: "Outline" },
  { icon: PenLine, label: "Write" },
  { icon: ImageIcon, label: "Illustrate" },
  { icon: Rocket, label: "Publish" },
] as const;

const EXAMPLES = [
  "A fantasy novel about a cartographer who maps dreams",
  "A nonfiction guide: how to build a calm productivity system",
  "A thriller where every chapter is a different suspect's confession",
  "A children's picture book about a robot who learns to garden",
];

export function HydraSkriptDemo() {
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState("");
  const [outline, setOutline] = useState<Outline | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [busyChapter, setBusyChapter] = useState<number | null>(null);
  const [palette, setPalette] = useState<CoverPalette>(COVER_PALETTES[0]);
  const [coverSvg, setCoverSvg] = useState<string | null>(null);
  const [chapterArt, setChapterArt] = useState<string[] | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [narrating, setNarrating] = useState<string>("");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
    return () => synthRef.current?.cancel();
  }, []);

  const approvedCount = outline ? outline.chapters.filter((c) => c.approved).length : 0;
  const totalWords = outline ? wordCount(outline) : 0;

  function startOutline() {
    setOutline(generateOutline(idea));
    setActiveChapter(0);
    setStep(1);
  }

  function coAuthor(idx: number, regenerate = false) {
    if (!outline) return;
    if (!regenerate && outline.chapters[idx].draft.trim()) {
      // already drafted — jump to edit
      setActiveChapter(idx);
      return;
    }
    setBusyChapter(idx);
    setActiveChapter(idx);
    const snapshot = outline;
    setTimeout(() => {
      const draft = generateChapterDraft(idea, snapshot.chapters[idx], idx, snapshot.chapters.length, snapshot.kind);
      setOutline((prev) =>
        prev
          ? {
              ...prev,
              chapters: prev.chapters.map((c, i) => (i === idx ? { ...c, draft } : c)),
            }
          : prev
      );
      setBusyChapter(null);
    }, 650);
  }

  function toggleApprove(idx: number) {
    if (!outline) return;
    setOutline({
      ...outline,
      chapters: outline.chapters.map((c, i) =>
        i === idx ? { ...c, approved: !c.approved } : c
      ),
    });
  }

  function updateChapterTitle(idx: number, value: string) {
    if (!outline) return;
    setOutline({
      ...outline,
      chapters: outline.chapters.map((c, i) => (i === idx ? { ...c, title: value } : c)),
    });
  }

  function updateDraft(idx: number, value: string) {
    if (!outline) return;
    setOutline({
      ...outline,
      chapters: outline.chapters.map((c, i) => (i === idx ? { ...c, draft: value } : c)),
    });
  }

  function addChapter() {
    if (!outline) return;
    setOutline({
      ...outline,
      chapters: [
        ...outline.chapters,
        {
          title: `New Chapter ${outline.chapters.length + 1}`,
          summary: "Describe what this chapter accomplishes in the arc of the book.",
          goal: "Advance the reader toward a finished manuscript.",
          draft: "",
          approved: false,
        },
      ],
    });
  }

  function removeChapter(idx: number) {
    if (!outline || outline.chapters.length <= 1) return;
    setOutline({
      ...outline,
      chapters: outline.chapters.filter((_, i) => i !== idx),
    });
    setActiveChapter((a) => Math.max(0, Math.min(a, outline!.chapters.length - 2)));
  }

  function buildCover() {
    if (!outline) return;
    setCoverSvg(generateCoverSvg(outline, palette));
    setChapterArt(outline.chapters.map((c, i) => generateChapterArt(c, palette, i)));
  }

  function exportAs(kind: "md" | "txt" | "json") {
    if (!outline) return;
    const name = outline.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "hydraskript-book";
    if (kind === "md") downloadFile(`${name}.md`, buildMarkdown(outline), "text/markdown");
    if (kind === "txt") downloadFile(`${name}.txt`, buildPlain(outline), "text/plain");
    if (kind === "json") downloadFile(`${name}.json`, buildJson(outline), "application/json");
  }

  function playAudiobook() {
    if (!outline || !synthRef.current) return;
    const synth = synthRef.current;
    synth.cancel();
    const text = buildPlain(outline);
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    const voices = synth.getVoices();
    if (voices.length) utter.voice = voices.find((v) => /en/i.test(v.lang)) ?? voices[0];
    utter.onstart = () => {
      setSpeaking(true);
      setNarrating("Narrating your book…");
    };
    utter.onend = () => {
      setSpeaking(false);
      setNarrating("");
    };
    synth.speak(utter);
  }

  function stopAudiobook() {
    synthRef.current?.cancel();
    setSpeaking(false);
    setNarrating("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Demo chrome */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/product/hydraskript"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listing
        </Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300">
          <Wand2 className="h-3.5 w-3.5" /> HydraSkript · Live Demo
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">AI Co-Authoring Studio</h1>
        <p className="mt-1 text-slate-400">
          Turn an idea into an outlined, written, illustrated and narrated book — entirely in this demo.
        </p>
      </div>

      {/* Stepper */}
      <ol className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step || (i === 1 && outline) || (i === 2 && approvedCount === outline?.chapters.length);
          return (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => outline && i <= step && setStep(i)}
                disabled={!outline && i > 0}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  i === step
                    ? "border-cyan-600 bg-cyan-500/10 text-cyan-200"
                    : done
                    ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-300"
                    : "border-slate-800 bg-slate-900/40 text-slate-500"
                } ${!outline && i > 0 ? "cursor-not-allowed opacity-60" : "hover:border-cyan-700"}`}
              >
                <Icon className="h-4 w-4" />
                {s.label}
                {done && i !== step && <Check className="h-3.5 w-3.5" />}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Step content */}
      {step === 0 && (
        <IdeaStep
          idea={idea}
          setIdea={setIdea}
          examples={EXAMPLES}
          onStart={startOutline}
        />
      )}

      {step === 1 && outline && (
        <OutlineStep
          outline={outline}
          setOutline={setOutline}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && outline && (
        <WriteStep
          outline={outline}
          activeChapter={activeChapter}
          setActiveChapter={setActiveChapter}
          busyChapter={busyChapter}
          approvedCount={approvedCount}
          onCoAuthor={(i) => coAuthor(i)}
          onRegenerate={(i) => coAuthor(i, true)}
          onToggleApprove={toggleApprove}
          onTitle={updateChapterTitle}
          onDraftChange={updateDraft}
          onAdd={addChapter}
          onRemove={removeChapter}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && outline && (
        <IllustrateStep
          palette={palette}
          setPalette={setPalette}
          coverSvg={coverSvg}
          chapterArt={chapterArt}
          onBuild={buildCover}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && outline && (
        <PublishStep
          outline={outline}
          words={totalWords}
          approvedCount={approvedCount}
          speaking={speaking}
          narrating={narrating}
          onExport={exportAs}
          onPlay={playAudiobook}
          onStop={stopAudiobook}
          onBack={() => setStep(3)}
        />
      )}

      <p className="mt-10 text-center text-xs text-slate-600">
        This is a self-contained demo of HydraSkript. No data leaves your browser.
      </p>
    </div>
  );
}

// ---- Step 0: Idea -----------------------------------------------------

function IdeaStep({
  idea,
  setIdea,
  examples,
  onStart,
}: {
  idea: string;
  setIdea: (v: string) => void;
  examples: string[];
  onStart: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
      <label className="block text-sm font-semibold text-slate-200">
        What is your book about?
      </label>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={5}
        placeholder="e.g. A sci-fi mystery set on a generation ship where the AI has started lying…"
        className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-700"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setIdea(ex)}
            className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-cyan-700 hover:text-cyan-300"
          >
            {ex}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={!idea.trim()}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" /> Generate outline
      </button>
    </div>
  );
}

// ---- Step 1: Outline --------------------------------------------------

function OutlineStep({
  outline,
  setOutline,
  onNext,
  onBack,
}: {
  outline: Outline;
  setOutline: (o: Outline) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <label className="text-sm font-semibold text-slate-200">Title</label>
        <input
          value={outline.title}
          onChange={(e) => setOutline({ ...outline, title: e.target.value })}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-cyan-700"
        />
        <label className="mt-4 block text-sm font-semibold text-slate-200">Subtitle</label>
        <input
          value={outline.subtitle}
          onChange={(e) => setOutline({ ...outline, subtitle: e.target.value })}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 outline-none focus:border-cyan-700"
        />
        <label className="mt-4 block text-sm font-semibold text-slate-200">Premise</label>
        <textarea
          value={outline.premise}
          onChange={(e) => setOutline({ ...outline, premise: e.target.value })}
          rows={6}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 outline-none focus:border-cyan-700"
        />
        <p className="mt-3 text-xs uppercase tracking-wide text-cyan-400">
          {outline.kind === "nonfiction" ? "Non-fiction" : "Fiction"} · {outline.chapters.length} chapters
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold text-slate-200">Chapter outline</h3>
        <p className="mt-1 text-xs text-slate-500">
          HydraSkript proposed this structure. Edit titles, then move on to co-authoring.
        </p>
        <ol className="mt-4 space-y-3">
          {outline.chapters.map((c, i) => (
            <li key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400">{String(i + 1).padStart(2, "0")}</span>
                <input
                  value={c.title}
                  onChange={(e) =>
                    setOutline({
                      ...outline,
                      chapters: outline.chapters.map((ch, j) =>
                        j === i ? { ...ch, title: e.target.value } : ch
                      ),
                    })
                  }
                  className="flex-1 bg-transparent text-sm font-medium text-slate-100 outline-none"
                />
              </div>
              <p className="mt-1 pl-7 text-xs text-slate-500">{c.summary}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex justify-between lg:col-span-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Idea
        </button>
        <button onClick={onNext} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
          Start writing <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---- Step 2: Write ----------------------------------------------------

function WriteStep({
  outline,
  activeChapter,
  setActiveChapter,
  busyChapter,
  approvedCount,
  onCoAuthor,
  onRegenerate,
  onToggleApprove,
  onTitle,
  onDraftChange,
  onAdd,
  onRemove,
  onNext,
  onBack,
}: {
  outline: Outline;
  activeChapter: number;
  setActiveChapter: (i: number) => void;
  busyChapter: number | null;
  approvedCount: number;
  onCoAuthor: (i: number) => void;
  onRegenerate: (i: number) => void;
  onToggleApprove: (i: number) => void;
  onTitle: (i: number, v: string) => void;
  onDraftChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const ch = outline.chapters[activeChapter];
  const allApproved = approvedCount === outline.chapters.length;
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">Chapters</h3>
          <button onClick={onAdd} className="text-xs text-cyan-400 hover:text-cyan-300">+ Add</button>
        </div>
        <ul className="mt-3 space-y-1.5">
          {outline.chapters.map((c, i) => (
            <li key={i}>
              <button
                onClick={() => setActiveChapter(i)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  i === activeChapter ? "bg-cyan-500/10 text-cyan-200" : "text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                <span className="font-mono text-xs text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 truncate">{c.title}</span>
                {c.approved && <Check className="h-3.5 w-3.5 text-emerald-400" />}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
          {approvedCount}/{outline.chapters.length} chapters approved
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <input
              value={ch.title}
              onChange={(e) => onTitle(activeChapter, e.target.value)}
              className="w-full bg-transparent text-xl font-bold text-white outline-none"
            />
            <p className="mt-1 text-sm text-slate-500">{ch.summary}</p>
          </div>
          <button
            onClick={() => onRemove(activeChapter)}
            disabled={outline.chapters.length <= 1}
            className="shrink-0 rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-300 disabled:opacity-40"
          >
            Remove
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {!ch.draft.trim() ? (
            <button
              onClick={() => onCoAuthor(activeChapter)}
              disabled={busyChapter === activeChapter}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {busyChapter === activeChapter ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
              {busyChapter === activeChapter ? "Co-authoring…" : "Co-author this chapter"}
            </button>
          ) : (
            <>
              <button
                onClick={() => onRegenerate(activeChapter)}
                disabled={busyChapter === activeChapter}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60 disabled:opacity-60"
              >
                {busyChapter === activeChapter ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Regenerate
              </button>
              <button
                onClick={() => onToggleApprove(activeChapter)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  ch.approved ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : "border border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/40"
                }`}
              >
                <Check className="h-4 w-4" /> {ch.approved ? "Approved" : "Approve"}
              </button>
            </>
          )}
        </div>

        <textarea
          value={ch.draft}
          onChange={(e) => onDraftChange(activeChapter, e.target.value)}
          rows={12}
          placeholder="Your co-authored draft will appear here. Edit it freely."
          className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-200 outline-none focus:border-cyan-700"
        />

        <div className="mt-6 flex items-center justify-between">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Outline
          </button>
          <button
            onClick={onNext}
            disabled={!allApproved}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            title={!allApproved ? "Approve every chapter to continue" : ""}
          >
            Illustrate <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Step 3: Illustrate ----------------------------------------------

function IllustrateStep({
  palette,
  setPalette,
  coverSvg,
  chapterArt,
  onBuild,
  onBack,
  onNext,
}: {
  palette: CoverPalette;
  setPalette: (p: CoverPalette) => void;
  coverSvg: string | null;
  chapterArt: string[] | null;
  onBuild: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold text-slate-200">Cover palette</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {COVER_PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPalette(p)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                palette.id === p.id ? "border-cyan-600 text-cyan-200" : "border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }} />
              {p.name}
            </button>
          ))}
        </div>

        <button
          onClick={onBuild}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          <Wand2 className="h-4 w-4" /> Generate cover & illustrations
        </button>

        {coverSvg && (
          <div
            className="mt-5 overflow-hidden rounded-xl border border-slate-800"
            dangerouslySetInnerHTML={{ __html: coverSvg }}
          />
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold text-slate-200">Chapter artwork</h3>
        <p className="mt-1 text-xs text-slate-500">A generated motif for each chapter, seeded from its title.</p>
        {chapterArt ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {chapterArt.map((art, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-800" dangerouslySetInnerHTML={{ __html: art }} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">Generate artwork to preview it here.</p>
        )}
      </div>

      <div className="flex justify-between lg:col-span-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Write
        </button>
        <button onClick={onNext} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
          Publish <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---- Step 4: Publish --------------------------------------------------

function PublishStep({
  outline,
  words,
  approvedCount,
  speaking,
  narrating,
  onExport,
  onPlay,
  onStop,
  onBack,
}: {
  outline: Outline;
  words: number;
  approvedCount: number;
  speaking: boolean;
  narrating: string;
  onExport: (k: "md" | "txt" | "json") => void;
  onPlay: () => void;
  onStop: () => void;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold text-slate-200">Your manuscript</h3>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Title</dt>
            <dd className="mt-1 font-medium text-slate-100">{outline.title}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Type</dt>
            <dd className="mt-1 font-medium text-slate-100">{outline.kind === "nonfiction" ? "Non-fiction" : "Fiction"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Chapters</dt>
            <dd className="mt-1 font-medium text-slate-100">{outline.chapters.length} ({approvedCount} approved)</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Words</dt>
            <dd className="mt-1 font-medium text-slate-100">{words.toLocaleString()}</dd>
          </div>
        </dl>

        <h4 className="mt-6 text-sm font-semibold text-slate-200">Export</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => onExport("md")} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60">
            <Download className="h-4 w-4" /> Markdown
          </button>
          <button onClick={() => onExport("txt")} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60">
            <Download className="h-4 w-4" /> Plain text
          </button>
          <button onClick={() => onExport("json")} className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/60">
            <Download className="h-4 w-4" /> JSON
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-sm font-semibold text-slate-200">Audiobook</h3>
        <p className="mt-1 text-xs text-slate-500">
          HydraSkript narrates the full manuscript using your browser&apos;s built-in speech engine.
        </p>
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-300">{narrating || "Ready to narrate."}</p>
          <div className="mt-4 flex gap-2">
            {!speaking ? (
              <button onClick={onPlay} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                <Play className="h-4 w-4" /> Play audiobook
              </button>
            ) : (
              <button onClick={onStop} className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-400">
                <Square className="h-4 w-4" /> Stop
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-4 text-sm text-slate-300">
          <BookOpen className="mb-2 h-4 w-4 text-cyan-400" />
          This is a working demo of HydraSkript&apos;s publish pipeline: outline → write → illustrate → export → narrate.
        </div>
      </div>

      <div className="flex justify-between lg:col-span-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Illustrate
        </button>
        <Link href="/product/hydraskript" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
          Finish <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
