"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Brain, CheckCircle2, Clock, TrendingUp, TrendingDown, Heart, Calendar } from "lucide-react";
import type { Child } from "@/lib/dashboard-data";
import {
  getMentalDrills,
  type MentalDrills,
  type DrillAttempt,
  type DrillAlert,
  type MentalDrillsDay,
} from "@/lib/api";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

type PeriodFilter = "today" | "week" | "month" | "all";

const periodLabels: Record<PeriodFilter, string> = {
  today: "Today",
  week:  "This Week",
  month: "This Month",
  all:   "All Time",
};

const periodToTimeframe: Record<PeriodFilter, "today" | "this_week" | "this_month" | "all_time"> = {
  today: "today",
  week:  "this_week",
  month: "this_month",
  all:   "all_time",
};

/* ─── Accuracy colour ────────────────────────────────────── */
function accuracyColor(accuracy: number) {
  if (accuracy >= 80) return "text-[oklch(0.55_0.14_168)]";
  if (accuracy >= 50) return "text-[oklch(0.65_0.12_75)]";
  return "text-[oklch(0.55_0.18_25)]";
}

/* ─── Single drill row ───────────────────────────────────── */
function DrillRow({ attempt, timeKey }: { attempt: DrillAttempt; timeKey: string }) {
  const timeLabel = attempt.completed_at ?? attempt.time_label ?? "";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex items-center gap-3 min-w-0">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[oklch(0.65_0.15_168)]" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{attempt.subsection_name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{timeLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-bold ${accuracyColor(attempt.accuracy)}`}>
          {attempt.score}
        </span>
        <span className="rounded-full bg-[oklch(0.65_0.15_168)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
          Completed
        </span>
      </div>
    </div>
  );
}

/* ─── Alert card ─────────────────────────────────────────── */
function AlertCard({ alert }: { alert: DrillAlert }) {
  const isPromotion = alert.change_type === "Promotion";
  return (
    <motion.div
      variants={fadeUp}
      className={`surface-card flex items-start gap-3 p-4 ${
        isPromotion
          ? "border-l-4 border-l-[oklch(0.68_0.17_145)] bg-[oklch(0.93_0.06_145)]/20"
          : "border-l-4 border-l-[oklch(0.78_0.16_75)] bg-[oklch(0.95_0.07_75)]/20"
      }`}
    >
      {isPromotion
        ? <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.14_145)]" />
        : <Heart      className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.65_0.12_75)]" />
      }
      <div>
        <p className={`text-sm font-semibold ${isPromotion ? "text-[oklch(0.45_0.14_145)]" : "text-[oklch(0.50_0.12_75)]"}`}>
          {isPromotion ? "🎉 " : ""}{alert.subsection_name} — {alert.message}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{alert.subtext}</p>
      </div>
    </motion.div>
  );
}

/* ─── Today's activity ───────────────────────────────────── */
function TodayActivity({ data }: { data: MentalDrills["today_activity"] }) {
  const hasLogical    = data.logical_drills.length > 0;
  const hasLinguistic = data.linguistic_reasoning.length > 0;

  if (!hasLogical && !hasLinguistic) {
    return (
      <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-2 py-10 text-center">
        <Brain className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No drills completed today yet.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {hasLogical && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Logical Reasoning</p>
          <p className="mb-4 text-xs text-muted-foreground">Completed today</p>
          <div className="flex flex-col gap-2">
            {data.logical_drills.map((a) => (
              <DrillRow key={a.attempt_id} attempt={a} timeKey="today-log" />
            ))}
          </div>
        </motion.div>
      )}
      {hasLinguistic && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Linguistic Reasoning</p>
          <p className="mb-4 text-xs text-muted-foreground">Completed today</p>
          <div className="flex flex-col gap-2">
            {data.linguistic_reasoning.map((a) => (
              <DrillRow key={a.attempt_id} attempt={a} timeKey="today-lin" />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Past activity grouped by day ──────────────────────── */
function PastActivity({ days }: { days: MentalDrillsDay[] }) {
  if (days.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center gap-2 py-10 text-center">
        <Calendar className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No activity in this period.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <motion.div key={day.date} variants={fadeUp} className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-semibold text-foreground">{day.display_date}</p>
            <p className="text-xs text-muted-foreground">{day.day_label}</p>
          </div>
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:divide-x divide-border">
            <div className="p-4">
              {day.logical_drills.length > 0 ? (
                <>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[oklch(0.65_0.12_75)]">
                    Logical Reasoning
                  </p>
                  <div className="flex flex-col gap-2">
                    {day.logical_drills.map((a) => (
                      <DrillRow key={a.attempt_id} attempt={a} timeKey={`${day.date}-log`} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">No logical drills</p>
              )}
            </div>
            <div className="p-4">
              {day.linguistic_reasoning.length > 0 ? (
                <>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[oklch(0.55_0.14_168)]">
                    Linguistic Reasoning
                  </p>
                  <div className="flex flex-col gap-2">
                    {day.linguistic_reasoning.map((a) => (
                      <DrillRow key={a.attempt_id} attempt={a} timeKey={`${day.date}-lin`} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">No linguistic drills</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Mental Drill Section ───────────────────────────────── */
export function MentalDrillSection({ child, studentId }: { child: Child; studentId: number }) {
  const [period, setPeriod]   = useState<PeriodFilter>("week");
  const [data, setData]       = useState<MentalDrills | null>(null);
  const [loading, setLoading] = useState(false);
  const firstName = child.name.split(" ")[0];

  useEffect(() => {
    if (Number.isNaN(studentId)) return;
    setLoading(true);
    getMentalDrills(studentId, periodToTimeframe[period])
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId, period]);

  /* Fall back to child notifications when no API data */
  const alerts: DrillAlert[] = data?.alerts ?? [];
  const todayActivity = data?.today_activity ?? { logical_drills: [], linguistic_reasoning: [] };
  const pastDays = data?.past_activity ?? [];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Mental Drill
          </h3>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          What {firstName} did today across reasoning categories
        </p>
      </motion.div>

      {/* Promotion / demotion alerts */}
      {alerts.length > 0 && alerts.map((alert, i) => (
        <AlertCard key={i} alert={alert} />
      ))}

      {/* Fallback: child.notifications when no API data */}
      {alerts.length === 0 && data === null && child.notifications.map((note, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          className={`surface-card flex items-start gap-3 p-4 ${
            note.color === "success"
              ? "border-l-4 border-l-[oklch(0.68_0.17_145)] bg-[oklch(0.93_0.06_145)]/20"
              : "border-l-4 border-l-[oklch(0.78_0.16_75)] bg-[oklch(0.95_0.07_75)]/20"
          }`}
        >
          {note.color === "success"
            ? <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.14_145)]" />
            : <Heart      className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.65_0.12_75)]" />
          }
          <div>
            <p className={`text-sm font-semibold ${note.color === "success" ? "text-[oklch(0.45_0.14_145)]" : "text-[oklch(0.50_0.12_75)]"}`}>
              {note.color === "success" ? "🎉 " : ""}{note.title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{note.sub}</p>
          </div>
        </motion.div>
      ))}

      {/* Today's drills */}
      <TodayActivity data={todayActivity} />

      {/* Past activity */}
      <motion.div variants={fadeUp} className="surface-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Past Activity</p>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Tap a button below to see what {firstName} did in that period.
        </p>

        {/* Period filter */}
        <div className="mb-5">
          <p className="mb-2 text-xs text-muted-foreground">See what {firstName} did:</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(periodLabels) as PeriodFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  period === p
                    ? "gradient-brand text-white shadow-sm"
                    : "border border-border bg-muted text-muted-foreground hover:border-[oklch(0.65_0.15_168)]/40 hover:text-foreground"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[oklch(0.65_0.15_168)] border-t-transparent" />
              </div>
            ) : (
              <PastActivity days={pastDays} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

    </motion.div>
  );
}
