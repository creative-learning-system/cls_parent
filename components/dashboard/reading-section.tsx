"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { BookOpen, FileText, ChevronDown, Compass, RefreshCw } from "lucide-react";
import type { Child, ReadingEntry, ReadingPart } from "@/lib/dashboard-data";
import { getReadingReflections, getReadingInterests, type ReadingInterests } from "@/lib/api";
import { fetchCached, invalidateChild } from "@/lib/cache";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ─── Single accordion part ──────────────────────────────── */
function AccordionPart({ part, index, childName }: { part: ReadingPart; index: number; childName: string }) {
  const [open, setOpen] = useState(index === 0); // first part open by default

  return (
    <div className={`overflow-hidden rounded-xl border transition-colors ${
      open ? "border-[oklch(0.65_0.15_168)]/30 bg-[oklch(0.65_0.15_168)]/3" : "border-border bg-card"
    }`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
          open ? "bg-[oklch(0.65_0.15_168)] text-white" : "bg-muted text-muted-foreground"
        }`}>
          <FileText className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{part.label}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{part.question}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0"
        >
          <ChevronDown className={`h-4 w-4 transition-colors ${open ? "text-[oklch(0.65_0.15_168)]" : "text-muted-foreground"}`} />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Question */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Question
              </p>
              <p className="mb-4 text-sm text-foreground">{part.question}</p>

              {/* Answer */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {childName}&apos;s Answer
              </p>
              <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground">{part.answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Single reading entry card ──────────────────────────── */
function ReadingEntryCard({ entry, defaultOpen, childName }: { entry: ReadingEntry; defaultOpen: boolean; childName: string }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div variants={fadeUp} className="surface-card overflow-hidden">
      {/* Entry header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Topic
            </p>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              entry.date === "Today"
                ? "bg-[oklch(0.65_0.15_168)]/10 text-[oklch(0.50_0.14_168)]"
                : "bg-muted text-muted-foreground"
            }`}>
              {entry.date}
            </span>
          </div>
          <h3
            className="mt-1 text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {entry.topic}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {entry.parts.length} question{entry.parts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <ChevronDown className={`h-5 w-5 transition-colors ${open ? "text-[oklch(0.65_0.15_168)]" : "text-muted-foreground"}`} />
        </motion.div>
      </button>

      {/* Parts accordion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="parts"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-border px-6 pb-6 pt-4">
              {entry.parts.map((part, i) => (
                <AccordionPart key={part.id} part={part} index={i} childName={childName} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Career Paths view ──────────────────────────────────── */
function CareerPathsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="surface-card p-5 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function CareerPathsView({ studentId, firstName }: { studentId: number; firstName: string }) {
  const [data, setData]       = useState<ReadingInterests | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    fetchCached(`c${studentId}:reading-interests`, () => getReadingInterests(studentId))
      .then(d  => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId]);

  if (loading) return <CareerPathsSkeleton />;

  const careerPaths = data?.career_paths ?? [];
  const storyReflections = data?.reflections ?? [];

  if (!data || (careerPaths.length === 0 && storyReflections.length === 0)) {
    return (
      <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-2 py-12 text-center">
        <Compass className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No career paths explored yet by {firstName}.</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
      {careerPaths.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <div className="mb-1 flex items-center gap-2">
            <Compass className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
            <p className="text-sm font-semibold text-foreground">Career Paths Explored</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">{firstName} has explored these career topics through reading.</p>
          <div className="flex flex-col divide-y divide-border">
            {careerPaths.map(cp => (
              <div key={cp.CareerName} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.65_0.15_168)]/10">
                  <Compass className="h-4 w-4 text-[oklch(0.55_0.14_168)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{cp.CareerName}</p>
                  <p className="text-xs text-muted-foreground">
                    Last read {formatRelativeDate(cp.LastReadAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[oklch(0.65_0.15_168)]/10 px-2.5 py-1 text-[10px] font-bold text-[oklch(0.50_0.14_168)]">
                  {cp.StoriesRead} {cp.StoriesRead === 1 ? "story" : "stories"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {storyReflections.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <div className="mb-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
            <p className="text-sm font-semibold text-foreground">Story Reflections</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">Short reflections {firstName} wrote after reading stories.</p>
          <div className="flex flex-col gap-3">
            {storyReflections.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{r.StoryTitle}</p>
                  <span className="rounded-full bg-[oklch(0.65_0.15_168)]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[oklch(0.50_0.14_168)]">
                    {r.CareerName}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.ReflectionText}</p>
                <p className="mt-2 text-[10px] text-muted-foreground/60">{formatRelativeDate(r.SubmittedAt)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Reading skeleton ───────────────────────────────────── */
function ReadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="surface-card overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Reading section ────────────────────────────────────── */
type ReadingTab = "reflections" | "career-paths";

export function ReadingSection({ child, studentId }: { child: Child; studentId: number }) {
  const [tab, setTab]           = useState<ReadingTab>("reflections");
  const [entries, setEntries]   = useState<ReadingEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [retry, setRetry]       = useState(0);
  const firstName = child.name.split(" ")[0];

  useEffect(() => {
    if (Number.isNaN(studentId)) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setEntries([]);
    fetchCached(`c${studentId}:reading-reflections`, () => getReadingReflections(studentId))
      .then((data) => {
        if (cancelled) return;
        setEntries(
          data.reflections.map((r) => ({
            id:    String(r.reflection_id),
            topic: r.topic_title,
            date:  formatRelativeDate(r.submitted_at),
            parts: r.parts.map((p) => ({
              id:       String(p.part_number),
              label:    `Part ${p.part_number}`,
              question: p.question,
              answer:   p.answer,
            })),
          })),
        );
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Reading
          </h3>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {child.name}&apos;s reading reflections and career paths explored
        </p>
      </motion.div>

      {/* Sub-tab bar */}
      <motion.div variants={fadeUp} className="flex gap-1.5 rounded-2xl bg-muted p-1.5">
        {([
          { key: "reflections",  label: "Reflections",  icon: FileText  },
          { key: "career-paths", label: "Career Paths", icon: Compass   },
        ] as { key: ReadingTab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-white" : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="reading-tab-pill"
                  className="absolute inset-0 rounded-xl gradient-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative h-3.5 w-3.5" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "reflections" && (
            loading ? (
              <ReadingSkeleton />
            ) : error ? (
              <div className="surface-card flex items-center justify-between gap-4 p-5">
                <p className="text-sm text-muted-foreground">Could not load reading reflections.</p>
                <button
                  onClick={() => { invalidateChild(studentId); setRetry(r => r + 1); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline shrink-0"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            ) : entries.length === 0 ? (
              <div className="surface-card flex flex-col items-center gap-2 py-12 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No reading reflections yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {entries.map((entry, i) => (
                  <ReadingEntryCard key={entry.id} entry={entry} defaultOpen={i === 0} childName={firstName} />
                ))}
              </div>
            )
          )}
          {tab === "career-paths" && (
            <CareerPathsView studentId={studentId} firstName={firstName} />
          )}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
}
