"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ClipboardList, ChevronDown, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { getPretests, type PretestResult } from "@/lib/api";
import { fetchCached } from "@/lib/cache";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

function ScoreBar({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const color = pct >= 70 ? "bg-[oklch(0.65_0.15_168)]" : pct >= 50 ? "bg-[oklch(0.78_0.16_75)]" : "bg-[oklch(0.60_0.18_25)]";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className={`text-sm font-bold shrink-0 ${pct >= 70 ? "text-[oklch(0.50_0.14_168)]" : pct >= 50 ? "text-[oklch(0.55_0.12_75)]" : "text-[oklch(0.55_0.18_25)]"}`}>
        {score}/{total}
      </span>
    </div>
  );
}

function PretestCard({ pretest, defaultOpen }: { pretest: PretestResult; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = pretest.total > 0 ? Math.round((pretest.score / pretest.total) * 100) : 0;

  return (
    <motion.div variants={fadeUp} className="surface-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.65_0.15_168)]/10">
          <ClipboardList className="h-4 w-4 text-[oklch(0.55_0.14_168)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{pretest.subject}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(pretest.taken_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            pct >= 70
              ? "bg-[oklch(0.93_0.06_145)] text-[oklch(0.40_0.14_145)]"
              : pct >= 50
                ? "bg-[oklch(0.95_0.07_75)] text-[oklch(0.50_0.12_75)]"
                : "bg-[oklch(0.95_0.07_25)] text-[oklch(0.50_0.18_25)]"
          }`}>
            {pct}%
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className={`h-4 w-4 ${open ? "text-[oklch(0.65_0.15_168)]" : "text-muted-foreground"}`} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="topics"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 pb-4 pt-3">
              <ScoreBar score={pretest.score} total={pretest.total} />
              {pretest.topics.length > 0 && (
                <div className="mt-4 flex flex-col">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topics</p>
                  {pretest.topics.map((t, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 border-b border-border/50 last:border-0">
                      {t.correct
                        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[oklch(0.55_0.14_145)]" />
                        : <XCircle      className="h-3.5 w-3.5 shrink-0 text-[oklch(0.55_0.18_25)]" />
                      }
                      <p className="text-sm text-foreground">{t.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="surface-card p-5 flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function PretestsCard({ studentId, childName }: { studentId: number; childName: string }) {
  const [pretests, setPretests] = useState<PretestResult[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [retry, setRetry]       = useState(0);
  const firstName = childName.split(" ")[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchCached(`c${studentId}:pretests`, () => getPretests(studentId))
      .then((d)  => { if (!cancelled) setPretests(Array.isArray(d?.pretests) ? d.pretests : []); })
      .catch(()  => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="surface-card flex flex-col items-center gap-3 py-12 text-center">
        <ClipboardList className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Could not load pretest results.</p>
        <button
          onClick={() => setRetry(r => r + 1)}
          className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  if (pretests.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center gap-2 py-12 text-center">
        <ClipboardList className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No pretest results yet for {firstName}.</p>
      </div>
    );
  }

  const avgScore = Math.round(
    pretests.reduce((s, p) => s + (p.total > 0 ? (p.score / p.total) * 100 : 0), 0) / pretests.length,
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-4">

      {/* Summary */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <div className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {pretests.length}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pretests Taken</p>
        </div>
        <div className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          <p className={`text-2xl font-bold ${avgScore >= 70 ? "text-[oklch(0.45_0.14_145)]" : avgScore >= 50 ? "text-[oklch(0.55_0.12_75)]" : "text-[oklch(0.55_0.18_25)]"}`}
             style={{ fontFamily: "var(--font-dm-sans)" }}>
            {avgScore}<span className="text-sm font-normal text-muted-foreground">%</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Average Score</p>
        </div>
      </motion.div>

      {pretests.map((p, i) => (
        <PretestCard key={i} pretest={p} defaultOpen={i === 0} />
      ))}

    </motion.div>
  );
}
