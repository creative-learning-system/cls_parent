"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CheckCircle2, TrendingDown, TrendingUp, Lightbulb, MessageSquareText, BookOpen, X, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Child, Drill, ReadingEntry } from "@/lib/dashboard-data";
import { getReasoningSubsections, getReadingReflections } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ─── Medal config ───────────────────────────────────────── */
const medalEmoji = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold:   "🥇",
};

const medalGradient = {
  Bronze: "from-[oklch(0.92_0.06_55)] to-[oklch(0.86_0.08_55)] dark:from-[oklch(0.28_0.06_55)] dark:to-[oklch(0.22_0.05_55)]",
  Silver: "from-[oklch(0.93_0.01_240)] to-[oklch(0.87_0.02_240)] dark:from-[oklch(0.28_0.01_240)] dark:to-[oklch(0.22_0.01_240)]",
  Gold:   "from-[oklch(0.96_0.07_85)]  to-[oklch(0.90_0.10_85)]  dark:from-[oklch(0.30_0.07_85)]  dark:to-[oklch(0.24_0.06_85)]",
};

const medalText = {
  Bronze: "text-[oklch(0.52_0.10_55)]  dark:text-[oklch(0.78_0.10_55)]",
  Silver: "text-[oklch(0.45_0.02_240)] dark:text-[oklch(0.75_0.02_240)]",
  Gold:   "text-[oklch(0.50_0.12_85)]  dark:text-[oklch(0.82_0.12_85)]",
};

const medalBorder = {
  Bronze: "border-[oklch(0.80_0.08_55)]  dark:border-[oklch(0.38_0.07_55)]",
  Silver: "border-[oklch(0.80_0.02_240)] dark:border-[oklch(0.38_0.02_240)]",
  Gold:   "border-[oklch(0.82_0.10_85)]  dark:border-[oklch(0.40_0.08_85)]",
};

/* ─── Drill detail modal ─────────────────────────────────── */
function DrillModal({ drill, childName, onClose }: { drill: Drill; childName: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-[var(--shadow-modal)]"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.65_0.15_168)]/10 text-sm font-bold text-[oklch(0.55_0.14_168)]">
            {drill.code}
          </div>
          <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {drill.name}
          </h3>
        </div>

        {/* What it tests */}
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          What this drill tests
        </p>
        <p className="mb-5 text-sm leading-relaxed text-foreground">{drill.description}</p>

        {/* Level card */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/40 p-4">
          <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 ${medalBorder[drill.medal]} bg-card`}>
            <span className="text-2xl leading-none">{medalEmoji[drill.medal]}</span>
            <span className="text-[9px] font-bold text-muted-foreground mt-0.5">LV{drill.level}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Level</p>
            <p className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
              {drill.medal} — LV{drill.level}
            </p>
            {drill.recentlyPromoted && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[oklch(0.55_0.14_168)]">
                <ArrowUpCircle className="h-3.5 w-3.5" />
                {childName} was recently promoted in this drill
              </p>
            )}
            {drill.trend && !drill.recentlyPromoted && (
              <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                drill.trend === "promoted"
                  ? "text-[oklch(0.50_0.14_145)]"
                  : "text-[oklch(0.50_0.18_25)]"
              }`}>
                {drill.trend === "promoted"
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />
                }
                {childName} was recently {drill.trend} in this drill
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Reading understanding modal ────────────────────────── */
function ReadingModal({ entry, childName, onClose }: { entry: ReadingEntry; childName: string; onClose: () => void }) {
  const firstName = childName.split(" ")[0];
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-[var(--shadow-modal)]"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header */}
        <div className="mb-1 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[oklch(0.65_0.15_168)]" />
          <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {entry.topic}
          </h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          What {firstName} understood — read {entry.date.toLowerCase()}
        </p>

        {/* Parts */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          {entry.parts.map((part) => (
            <div key={part.id} className="rounded-xl border border-[oklch(0.65_0.15_168)]/15 bg-[oklch(0.65_0.15_168)]/4 p-4">
              <p className="mb-1 text-xs font-semibold text-[oklch(0.55_0.14_168)]">{part.label}</p>
              <p className="mb-2 text-sm text-muted-foreground">{part.question}</p>
              <p className="text-sm font-medium text-foreground">{part.answer}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Home section ───────────────────────────────────────── */
export function HomeSection({ child, studentId }: { child: Child; studentId: number }) {
  const [drillModal, setDrillModal]     = useState<Drill | null>(null);
  const [readingModal, setReadingModal] = useState<ReadingEntry | null>(null);
  const [drillCategories, setDrillCategories] = useState(child.drillCategories);
  const [readingEntries, setReadingEntries]   = useState<ReadingEntry[]>(child.reading);
  const firstName = child.name.split(" ")[0];

  useEffect(() => {
    if (Number.isNaN(studentId)) return;

    getReasoningSubsections(studentId)
      .then((data) => {
        const toDrill = (s: typeof data.logical_reasoning[number]): Drill => ({
          id:          String(s.subsection_id),
          code:        s.subsection_code,
          name:        s.subsection_name,
          description: s.subsection_name,
          level:       s.current_level,
          medal:       (s.medal[0] + s.medal.slice(1).toLowerCase()) as Drill["medal"],
        });
        setDrillCategories([
          { id: "logical",    name: "Logical Reasoning",    icon: "logic",      drills: data.logical_reasoning.map(toDrill) },
          { id: "linguistic", name: "Linguistic Reasoning", icon: "linguistic", drills: data.linguistic_reasoning.map(toDrill) },
        ]);
      })
      .catch(() => {});

    getReadingReflections(studentId)
      .then((data) => {
        setReadingEntries(
          data.reflections.map((r) => ({
            id:    String(r.reflection_id),
            topic: r.topic_title,
            date:  formatRelativeDate(r.submitted_at),
            parts: r.parts.map((p) => ({
              id:       String(p.part_number),
              label:    `${firstName} Part ${p.part_number}`,
              question: p.question,
              answer:   p.answer,
            })),
          })),
        );
      })
      .catch(() => {});
  }, [studentId, firstName]);

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

        {/* Profile card */}
        <motion.div variants={fadeUp} className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full gradient-brand text-xl font-bold text-white">
            {child.initials}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {child.name}
              </h2>
              <span className={child.tagColor === "amber" ? "badge-amber" : "badge-brand"}>
                {child.tag}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{child.grade} · {child.level}</p>
            <div className="flex flex-wrap gap-2">
              {child.subjects.map((s) => (
                <span key={s} className="rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-1">
              <Button size="sm" className="gradient-brand border-0 text-white hover:opacity-90">
                {child.learningStatus}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Drill categories */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {drillCategories.map((cat) => (
            <motion.div key={cat.id} variants={fadeUp} className="surface-card p-5">
              {/* Category header */}
              <div className="mb-1 flex items-center gap-2">
                {cat.icon === "logic"
                  ? <Lightbulb className="h-4 w-4 text-[oklch(0.78_0.16_75)]" />
                  : <MessageSquareText className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
                }
                <p className="text-sm font-semibold text-foreground">{cat.name}</p>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Each drill shows its own medal &amp; level. Tap a drill for details.
              </p>

              {/* Drill grid */}
              <div className="grid grid-cols-3 gap-2">
                {cat.drills.map((drill) => (
                  <button
                    key={drill.id}
                    onClick={() => setDrillModal(drill)}
                    className={`group relative flex flex-col items-start gap-1.5 rounded-xl border bg-gradient-to-br p-3 text-left transition-all hover:scale-[1.03] hover:shadow-md active:scale-[0.98] ${medalGradient[drill.medal]} ${medalBorder[drill.medal]}`}
                  >
                    {/* Code */}
                    <p className={`text-sm font-extrabold tracking-tight ${medalText[drill.medal]}`}>
                      {drill.code}
                    </p>
                    {/* Medal emoji + level */}
                    <div className="flex items-center gap-1">
                      <span className="text-base leading-none">{medalEmoji[drill.medal]}</span>
                      <span className={`text-[10px] font-bold ${medalText[drill.medal]}`}>LV{drill.level}</span>
                    </div>
                    {/* Medal label */}
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${medalText[drill.medal]}`}>
                      {drill.medal}
                    </p>
                    {/* Trend arrow — top right */}
                    {drill.trend && (
                      <span
                        className={`absolute right-2 top-2 text-sm leading-none ${
                          drill.trend === "promoted"
                            ? "text-[oklch(0.55_0.14_145)]"
                            : "text-[oklch(0.55_0.18_25)]"
                        }`}
                        title={drill.trend === "promoted" ? "Recently promoted" : "Recently demoted"}
                      >
                        {drill.trend === "promoted" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reading activity */}
        <motion.div variants={fadeUp} className="surface-card p-5">
          <div className="mb-1 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
            <p className="text-sm font-semibold text-foreground">Reading Activity</p>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            What {firstName} has been reading recently
          </p>
          <div className="flex flex-col divide-y divide-border">
            {readingEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">{firstName} read </span>
                    <span className="font-medium text-[oklch(0.55_0.14_168)]">{entry.topic}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
                <button
                  onClick={() => setReadingModal(entry)}
                  className="shrink-0 flex items-center gap-1 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline"
                >
                  See What {firstName} Understands
                  <TrendingUp className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <div className="flex flex-col gap-3">
          {child.notifications.map((note, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`surface-card flex items-start gap-3 p-4 ${
                note.color === "success"
                  ? "border-l-4 border-l-[oklch(0.68_0.17_145)]"
                  : "border-l-4 border-l-[oklch(0.78_0.16_75)]"
              }`}
            >
              {note.color === "success"
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.68_0.17_145)]" />
                : <TrendingDown  className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.78_0.16_75)]" />
              }
              <div>
                <p className="text-sm font-medium text-foreground">{note.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{note.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {drillModal && (
          <DrillModal
            key="drill-modal"
            drill={drillModal}
            childName={firstName}
            onClose={() => setDrillModal(null)}
          />
        )}
        {readingModal && (
          <ReadingModal
            key="reading-modal"
            entry={readingModal}
            childName={child.name}
            onClose={() => setReadingModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
