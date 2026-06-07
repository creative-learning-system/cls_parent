"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { CalendarDays, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { getComplianceHistory, type ComplianceDay } from "@/lib/api";
import { fetchCached } from "@/lib/cache";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

function DayCell({ day }: { day: ComplianceDay }) {
  const allMet  = day.LogicalTargetMet && day.LinguisticTargetMet && day.ReadingReflectionCompleted;
  const noneMet = !day.LogicalTargetMet && !day.LinguisticTargetMet && !day.ReadingReflectionCompleted;
  const date    = new Date(day.date);
  const dayNum  = date.getDate();

  return (
    <div
      title={`${date.toDateString()} — Logical: ${day.LogicalTargetMet ? "✓" : "✗"} | Linguistic: ${day.LinguisticTargetMet ? "✓" : "✗"} | Reading: ${day.ReadingReflectionCompleted ? "✓" : "✗"}`}
      className={`flex flex-col items-center gap-1 rounded-xl border p-2 cursor-default transition-colors ${
        allMet
          ? "border-[oklch(0.68_0.17_145)]/40 bg-[oklch(0.93_0.06_145)]/30"
          : noneMet
            ? "border-border bg-muted/20"
            : "border-[oklch(0.78_0.16_75)]/30 bg-[oklch(0.95_0.07_75)]/20"
      }`}
    >
      <span className="text-[10px] font-bold text-muted-foreground">{dayNum}</span>
      {allMet
        ? <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.55_0.14_145)]" />
        : noneMet
          ? <XCircle     className="h-3.5 w-3.5 text-muted-foreground/25" />
          : (
            <div className="flex gap-0.5">
              <div className={`h-1.5 w-1.5 rounded-full ${day.LogicalTargetMet            ? "bg-[oklch(0.78_0.16_75)]"  : "bg-muted-foreground/25"}`} />
              <div className={`h-1.5 w-1.5 rounded-full ${day.LinguisticTargetMet         ? "bg-[oklch(0.65_0.15_168)]" : "bg-muted-foreground/25"}`} />
              <div className={`h-1.5 w-1.5 rounded-full ${day.ReadingReflectionCompleted  ? "bg-[oklch(0.68_0.17_145)]" : "bg-muted-foreground/25"}`} />
            </div>
          )
      }
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="surface-card p-5">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

export function ComplianceHistoryCard({ studentId, childName }: { studentId: number; childName: string }) {
  const [days, setDays]       = useState<ComplianceDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [retry, setRetry]     = useState(0);
  const firstName = childName.split(" ")[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchCached(`c${studentId}:compliance-history`, () => getComplianceHistory(studentId))
      .then((d)  => { if (!cancelled) setDays(Array.isArray(d?.compliance) ? d.compliance : []); })
      .catch(()  => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="surface-card flex flex-col items-center gap-3 py-12 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Could not load compliance history.</p>
        <button
          onClick={() => setRetry(r => r + 1)}
          className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center gap-2 py-12 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No compliance history yet for {firstName}.</p>
      </div>
    );
  }

  const fullDays    = days.filter(d => d.LogicalTargetMet && d.LinguisticTargetMet && d.ReadingReflectionCompleted).length;
  const partialDays = days.filter(d => {
    const met = [d.LogicalTargetMet, d.LinguisticTargetMet, d.ReadingReflectionCompleted].filter(Boolean).length;
    return met > 0 && met < 3;
  }).length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Full Days",    value: fullDays,           color: "text-[oklch(0.45_0.14_145)]", bg: "bg-[oklch(0.93_0.06_145)]/30" },
          { label: "Partial Days", value: partialDays,        color: "text-[oklch(0.50_0.12_75)]",  bg: "bg-[oklch(0.95_0.07_75)]/30"  },
          { label: "Total Logged", value: days.length,        color: "text-foreground",              bg: "bg-muted/30"                   },
        ].map(({ label, value, color, bg }) => (
          <motion.div key={label} variants={fadeUp} className={`surface-card flex flex-col items-center gap-1 p-4 text-center ${bg}`}>
            <p className={`text-2xl font-bold ${color}`} style={{ fontFamily: "var(--font-dm-sans)" }}>{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div variants={fadeUp} className="surface-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
          <p className="text-sm font-semibold text-foreground">Last 30 Days</p>
        </div>

        {/* Day-name header — matches 7-column grid */}
        <div className="mb-1.5 grid grid-cols-7 gap-1.5">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <p key={i} className="text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => (
            <DayCell key={day.date} day={day} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
          {[
            { color: "bg-[oklch(0.68_0.17_145)]",  label: "All targets met" },
            { color: "bg-[oklch(0.78_0.16_75)]",   label: "Partial" },
            { color: "bg-muted-foreground/25",      label: "None met" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dot legend */}
      <motion.div variants={fadeUp} className="surface-card p-4">
        <p className="mb-3 text-xs font-semibold text-foreground">For partial days — what each dot means:</p>
        <div className="flex flex-wrap gap-4">
          {[
            { color: "bg-[oklch(0.78_0.16_75)]",  label: "Logical target met" },
            { color: "bg-[oklch(0.65_0.15_168)]", label: "Linguistic target met" },
            { color: "bg-[oklch(0.68_0.17_145)]", label: "Reading completed" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
