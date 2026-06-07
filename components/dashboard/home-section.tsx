"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  CheckCircle2, TrendingDown, TrendingUp, Lightbulb, MessageSquareText,
  BookOpen, X, ArrowUpCircle, ShieldOff, ShieldCheck, Send, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Child, Drill, ReadingEntry } from "@/lib/dashboard-data";
import {
  getReasoningSubsections,
  getReadingReflections,
  getChildSuspensionStatus,
  suspendChild,
  unsuspendChild,
  resendChildOnboarding,
} from "@/lib/api";
import { fetchCached, invalidateChild } from "@/lib/cache";
import { formatRelativeDate } from "@/lib/utils";
import { ActivityLogCard } from "@/components/dashboard/activity-log-card";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ─── Format raw API code → readable title ───────────────── */
function formatDrillName(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Medal config ───────────────────────────────────────── */
const medalEmoji = { Bronze: "🥉", Silver: "🥈", Gold: "🥇" };

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-[var(--shadow-modal)]"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.65_0.15_168)]/10 text-xl leading-none">
            {medalEmoji[drill.medal]}
          </div>
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {formatDrillName(drill.name || drill.code)}
          </h3>
        </div>

        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          What this drill tests
        </p>
        <p className="mb-5 text-sm leading-relaxed text-foreground">{formatDrillName(drill.description)}</p>

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
                drill.trend === "promoted" ? "text-[oklch(0.50_0.14_145)]" : "text-[oklch(0.50_0.18_25)]"
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 shadow-[var(--shadow-modal)]"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="mb-1 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[oklch(0.65_0.15_168)]" />
          <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {entry.topic}
          </h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          What {firstName} understood — read {entry.date.toLowerCase()}
        </p>
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
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

/* ─── Suspend confirmation modal ─────────────────────────── */
function SuspendModal({
  isSuspended,
  childName,
  loading,
  onConfirm,
  onCancel,
}: {
  isSuspended: boolean;
  childName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const firstName = childName.split(" ")[0];
  const suspending = !isSuspended;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-[var(--shadow-modal)]"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className={`mb-1 flex h-11 w-11 items-center justify-center rounded-xl ${
          suspending ? "bg-[oklch(0.95_0.07_25)]" : "bg-[oklch(0.93_0.06_145)]"
        }`}>
          {suspending
            ? <ShieldOff className="h-5 w-5 text-[oklch(0.50_0.18_25)]" />
            : <ShieldCheck className="h-5 w-5 text-[oklch(0.45_0.14_145)]" />
          }
        </div>

        <h3 className="mt-4 text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
          {suspending ? `Suspend ${firstName}?` : `Restore ${firstName}'s access?`}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {suspending
            ? `${firstName} will lose access to all drills, pretests, and reading activities until you restore it.`
            : `${firstName} will regain full access to all learning activities.`}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-muted/40 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 ${
              suspending ? "bg-[oklch(0.50_0.18_25)]" : "bg-[oklch(0.50_0.14_145)]"
            }`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {suspending ? "Suspend" : "Restore"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Skeleton: drill categories ────────────────────────── */
function DrillCategorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, j) => <Skeleton key={j} className="h-20 rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Skeleton: reading activity ─────────────────────────── */
function ReadingActivitySkeleton() {
  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-col">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-52" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Home section ───────────────────────────────────────── */
export function HomeSection({ child, studentId }: { child: Child; studentId: number }) {
  const [drillModal, setDrillModal]     = useState<Drill | null>(null);
  const [readingModal, setReadingModal] = useState<ReadingEntry | null>(null);

  const [drillCategories, setDrillCategories] = useState<Child["drillCategories"]>([]);
  const [readingEntries, setReadingEntries]   = useState<ReadingEntry[]>([]);
  const [loadingDrills, setLoadingDrills]     = useState(true);
  const [loadingReading, setLoadingReading]   = useState(true);
  const [errorDrills, setErrorDrills]         = useState(false);
  const [errorReading, setErrorReading]       = useState(false);
  const [retryDrills, setRetryDrills]         = useState(0);
  const [retryReading, setRetryReading]       = useState(0);

  const [isSuspended, setIsSuspended]       = useState<boolean | null>(null);
  const [suspendModal, setSuspendModal]     = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [resendLoading, setResendLoading]   = useState(false);
  const [resendDone, setResendDone]         = useState(false);

  const firstName = child.name.split(" ")[0];

  useEffect(() => {
    if (Number.isNaN(studentId)) return;
    let cancelled = false;

    setLoadingDrills(true);
    setLoadingReading(true);
    setErrorDrills(false);
    setErrorReading(false);
    setDrillCategories([]);
    setReadingEntries([]);

    fetchCached(`c${studentId}:reasoning-subsections`, () => getReasoningSubsections(studentId))
      .then((data) => {
        if (cancelled) return;
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
      .catch(() => { if (!cancelled) setErrorDrills(true); })
      .finally(() => { if (!cancelled) setLoadingDrills(false); });

    fetchCached(`c${studentId}:reading-reflections`, () => getReadingReflections(studentId))
      .then((data) => {
        if (cancelled) return;
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
      .catch(() => { if (!cancelled) setErrorReading(true); })
      .finally(() => { if (!cancelled) setLoadingReading(false); });

    getChildSuspensionStatus(studentId)
      .then((s)  => { if (!cancelled) setIsSuspended(s.is_suspended); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [studentId, firstName, retryDrills, retryReading]);

  async function handleSuspendConfirm() {
    setSuspendLoading(true);
    try {
      if (isSuspended) {
        await unsuspendChild(studentId);
        setIsSuspended(false);
      } else {
        await suspendChild(studentId);
        setIsSuspended(true);
      }
      invalidateChild(studentId);
    } catch {}
    setSuspendLoading(false);
    setSuspendModal(false);
  }

  async function handleResend() {
    setResendLoading(true);
    try {
      await resendChildOnboarding(studentId);
      setResendDone(true);
      setTimeout(() => setResendDone(false), 3000);
    } catch {}
    setResendLoading(false);
  }

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

        {/* Profile card */}
        <motion.div variants={fadeUp} className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full gradient-brand text-xl font-bold text-white">
            {child.initials}
          </div>
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {child.name}
              </h2>
              <span className={child.tagColor === "amber" ? "badge-amber" : "badge-brand"}>{child.tag}</span>
              {isSuspended !== null && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  isSuspended
                    ? "bg-[oklch(0.95_0.07_25)] text-[oklch(0.50_0.18_25)]"
                    : "bg-[oklch(0.93_0.06_145)] text-[oklch(0.40_0.14_145)]"
                }`}>
                  {isSuspended
                    ? <><ShieldOff className="h-2.5 w-2.5" /> Suspended</>
                    : <><ShieldCheck className="h-2.5 w-2.5" /> Active</>
                  }
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{child.grade} · {child.level}</p>

            <div className="flex flex-wrap gap-2">
              {child.subjects.map((s) => (
                <span key={s} className="rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Button size="sm" className="gradient-brand border-0 text-white hover:opacity-90">
                {child.learningStatus}
              </Button>

              {isSuspended !== null && (
                <button
                  onClick={() => setSuspendModal(true)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 ${
                    isSuspended
                      ? "border-[oklch(0.68_0.17_145)]/40 bg-[oklch(0.93_0.06_145)]/30 text-[oklch(0.40_0.14_145)]"
                      : "border-[oklch(0.60_0.22_25)]/30 bg-[oklch(0.95_0.07_25)]/30 text-[oklch(0.50_0.18_25)]"
                  }`}
                >
                  {isSuspended
                    ? <><ShieldCheck className="h-3 w-3" /> Restore Access</>
                    : <><ShieldOff   className="h-3 w-3" /> Suspend</>
                  }
                </button>
              )}

              <button
                onClick={handleResend}
                disabled={resendLoading || resendDone}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-60"
              >
                {resendLoading
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : resendDone
                    ? <CheckCircle2 className="h-3 w-3 text-[oklch(0.55_0.14_145)]" />
                    : <Send className="h-3 w-3" />
                }
                {resendDone ? "Sent!" : "Resend Onboarding"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Drill categories */}
        {loadingDrills ? (
          <DrillCategorySkeleton />
        ) : errorDrills ? (
          <motion.div variants={fadeUp} className="surface-card flex items-center justify-between gap-4 p-5">
            <p className="text-sm text-muted-foreground">Could not load drill categories.</p>
            <button
              onClick={() => { invalidateChild(studentId); setRetryDrills(r => r + 1); }}
              className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline shrink-0"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {drillCategories.map((cat) => (
              <motion.div key={cat.id} variants={fadeUp} className="surface-card p-5">
                <div className="mb-1 flex items-center gap-2">
                  {cat.icon === "logic"
                    ? <Lightbulb        className="h-4 w-4 text-[oklch(0.78_0.16_75)]" />
                    : <MessageSquareText className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
                  }
                  <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Each drill shows its own medal &amp; level. Tap a drill for details.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {cat.drills.map((drill) => (
                    <button
                      key={drill.id}
                      onClick={() => setDrillModal(drill)}
                      className={`group relative flex min-h-[5.5rem] flex-col justify-between rounded-xl border bg-gradient-to-br p-3 text-left transition-all hover:scale-[1.03] hover:shadow-md active:scale-[0.98] ${medalGradient[drill.medal]} ${medalBorder[drill.medal]}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-[11px] font-bold leading-snug ${medalText[drill.medal]}`}>
                          {formatDrillName(drill.name || drill.code)}
                        </p>
                        <span className="shrink-0 text-base leading-none">{medalEmoji[drill.medal]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold ${medalText[drill.medal]}`}>LV{drill.level}</span>
                        <span className={`text-[8px] font-semibold uppercase tracking-wider opacity-70 ${medalText[drill.medal]}`}>
                          {drill.medal}
                        </span>
                        {drill.trend && (
                          <span className={`ml-auto text-sm leading-none ${
                            drill.trend === "promoted" ? "text-[oklch(0.55_0.14_145)]" : "text-[oklch(0.55_0.18_25)]"
                          }`}>
                            {drill.trend === "promoted" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reading activity */}
        {loadingReading ? (
          <ReadingActivitySkeleton />
        ) : errorReading ? (
          <motion.div variants={fadeUp} className="surface-card flex items-center justify-between gap-4 p-5">
            <p className="text-sm text-muted-foreground">Could not load reading activity.</p>
            <button
              onClick={() => { invalidateChild(studentId); setRetryReading(r => r + 1); }}
              className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline shrink-0"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="surface-card p-5">
            <div className="mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
              <p className="text-sm font-semibold text-foreground">Reading Activity</p>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              What {firstName} has been reading recently
            </p>
            {readingEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No reading reflections yet.</p>
            ) : (
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
            )}
          </motion.div>
        )}

        {/* Activity log */}
        <ActivityLogCard studentId={studentId} />

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
        {suspendModal && isSuspended !== null && (
          <SuspendModal
            key="suspend-modal"
            isSuspended={isSuspended}
            childName={child.name}
            loading={suspendLoading}
            onConfirm={handleSuspendConfirm}
            onCancel={() => setSuspendModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
