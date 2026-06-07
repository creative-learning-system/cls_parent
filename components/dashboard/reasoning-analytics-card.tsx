"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Activity } from "lucide-react";
import { getReasoningAnalytics, type ReasoningAnalytics } from "@/lib/api";
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

function AccuracyRow({ date, logical, linguistic }: { date: string; logical: number | null; linguistic: number | null }) {
  const fmt = (v: number | null) =>
    v === null ? <span className="text-muted-foreground/40">—</span> : (
      <span className={v >= 70 ? "text-[oklch(0.50_0.14_168)]" : v >= 50 ? "text-[oklch(0.65_0.12_75)]" : "text-[oklch(0.55_0.18_25)]"}>
        {v}%
      </span>
    );

  return (
    <div className="grid grid-cols-3 items-center gap-3 py-2.5 border-b border-border/50 last:border-0 text-sm">
      <span className="text-muted-foreground text-xs">{new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
      <span className="font-semibold text-center">{fmt(logical)}</span>
      <span className="font-semibold text-center">{fmt(linguistic)}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="surface-card p-5">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="grid grid-cols-3 gap-3 py-2.5 border-b border-border/50 last:border-0">
            {[1, 2, 3].map(j => <Skeleton key={j} className="h-3 w-full" />)}
          </div>
        ))}
      </div>
      <div className="surface-card p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl mb-2" />)}
      </div>
    </div>
  );
}

export function ReasoningAnalyticsCard({ studentId, childName }: { studentId: number; childName: string }) {
  const [data, setData]       = useState<ReasoningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [retry, setRetry]     = useState(0);
  const firstName = childName.split(" ")[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchCached(`c${studentId}:reasoning-analytics`, () => getReasoningAnalytics(studentId))
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="surface-card flex flex-col items-center gap-3 py-12 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Could not load reasoning analytics.</p>
        <button
          onClick={() => setRetry(r => r + 1)}
          className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  const trends = [...(data.accuracy_trends ?? [])].reverse().slice(0, 14);
  const history = [...(data.level_history ?? [])].reverse().slice(0, 20);

  const avgLogical    = trends.filter(t => t.logical_accuracy !== null).map(t => t.logical_accuracy as number);
  const avgLinguistic = trends.filter(t => t.linguistic_accuracy !== null).map(t => t.linguistic_accuracy as number);
  const logAvg    = avgLogical.length    ? Math.round(avgLogical.reduce((a, b) => a + b, 0)    / avgLogical.length)    : null;
  const lingAvg   = avgLinguistic.length ? Math.round(avgLinguistic.reduce((a, b) => a + b, 0) / avgLinguistic.length) : null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">

      {/* Average summary */}
      {(logAvg !== null || lingAvg !== null) && (
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          {logAvg !== null && (
            <div className="surface-card flex flex-col items-center gap-1 p-4 text-center">
              <Activity className="h-4 w-4 text-[oklch(0.78_0.16_75)]" />
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {logAvg}<span className="text-sm font-normal text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Avg Logical Accuracy</p>
            </div>
          )}
          {lingAvg !== null && (
            <div className="surface-card flex flex-col items-center gap-1 p-4 text-center">
              <Activity className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {lingAvg}<span className="text-sm font-normal text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Avg Linguistic Accuracy</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Accuracy trends table */}
      {trends.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
            <p className="text-sm font-semibold text-foreground">Accuracy Trends</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Logical</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Linguistic</span>
          </div>
          {trends.map((t, i) => (
            <AccuracyRow key={i} date={t.date} logical={t.logical_accuracy} linguistic={t.linguistic_accuracy} />
          ))}
        </motion.div>
      )}

      {/* Level history */}
      {history.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[oklch(0.55_0.14_168)]" />
            <p className="text-sm font-semibold text-foreground">Level History — {firstName}</p>
          </div>
          <div className="flex flex-col gap-2">
            {history.map((h, i) => {
              const isPromotion = h.ChangeType === "Promotion";
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    isPromotion
                      ? "border-[oklch(0.68_0.17_145)]/30 bg-[oklch(0.93_0.06_145)]/20"
                      : "border-[oklch(0.78_0.16_75)]/30 bg-[oklch(0.95_0.07_75)]/20"
                  }`}
                >
                  {isPromotion
                    ? <TrendingUp   className="h-4 w-4 shrink-0 text-[oklch(0.50_0.14_145)]" />
                    : <TrendingDown className="h-4 w-4 shrink-0 text-[oklch(0.55_0.12_75)]" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isPromotion ? "text-[oklch(0.40_0.14_145)]" : "text-[oklch(0.50_0.12_75)]"}`}>
                      {h.ChangeType} — Drill Type {h.DrillTypeID}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {h.OldLevel} → Level {h.NewLevel}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(h.ChangedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {trends.length === 0 && history.length === 0 && (
        <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-2 py-12 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No analytics data available yet for {firstName}.</p>
        </motion.div>
      )}

    </motion.div>
  );
}
