"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { TrendingUp, TrendingDown, Trophy, CheckCircle2, XCircle, Clock, Target } from "lucide-react";
import type { Child } from "@/lib/dashboard-data";
import { getWeeklyCompliance, type WeeklyCompliance, type WeeklyComplianceDay } from "@/lib/api";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ─── Single day card ────────────────────────────────────── */
function DayCard({ day }: { day: WeeklyComplianceDay }) {
  const short = day.day_name.slice(0, 3);
  const totalMins = Math.round(day.logical_time_spent_mins + day.linguistic_time_spent_mins);

  return (
    <motion.div
      variants={fadeUp}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 sm:p-4 ${
        day.is_fully_compliant
          ? "border-[oklch(0.68_0.17_145)]/40 bg-[oklch(0.93_0.06_145)]/20"
          : "border-border bg-muted/20"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{short}</p>

      {day.is_fully_compliant
        ? <CheckCircle2 className="h-5 w-5 text-[oklch(0.55_0.14_145)]" />
        : <XCircle      className="h-5 w-5 text-muted-foreground/30" />
      }

      {/* Three target dots */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <div
            title="Logical"
            className={`h-2 w-2 rounded-full ${day.logical_target_met ? "bg-[oklch(0.78_0.16_75)]" : "bg-muted-foreground/25"}`}
          />
          <div
            title="Linguistic"
            className={`h-2 w-2 rounded-full ${day.linguistic_target_met ? "bg-[oklch(0.65_0.15_168)]" : "bg-muted-foreground/25"}`}
          />
          <div
            title="Reading"
            className={`h-2 w-2 rounded-full ${day.reading_reflection_completed ? "bg-[oklch(0.68_0.17_145)]" : "bg-muted-foreground/25"}`}
          />
        </div>
      </div>

      {totalMins > 0 && (
        <p className="text-[9px] font-medium text-muted-foreground">{totalMins}m</p>
      )}
    </motion.div>
  );
}

/* ─── Compliance view (live API data) ───────────────────── */
function ComplianceView({ data, childName }: { data: WeeklyCompliance; childName: string }) {
  const pct = Math.round(data.compliance_consistency_percentage);
  const improved = pct >= 70;

  const totalLogicalMins = data.weekly_daily_breakdown.reduce(
    (sum, d) => sum + d.logical_time_spent_mins, 0,
  );
  const totalLinguisticMins = data.weekly_daily_breakdown.reduce(
    (sum, d) => sum + d.linguistic_time_spent_mins, 0,
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Weekly Progress
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {childName}&apos;s last 7 days at a glance
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Days compliant */}
        <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          <Target className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {data.days_fully_compliant}
            <span className="text-sm font-normal text-muted-foreground">/{data.total_days_logged}</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Days</p>
        </motion.div>

        {/* Consistency % */}
        <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          {improved
            ? <TrendingUp   className="h-4 w-4 text-[oklch(0.55_0.14_145)]" />
            : <TrendingDown className="h-4 w-4 text-[oklch(0.55_0.18_25)]" />
          }
          <p className={`text-2xl font-bold ${improved ? "text-[oklch(0.45_0.14_145)]" : "text-[oklch(0.50_0.18_25)]"}`} style={{ fontFamily: "var(--font-dm-sans)" }}>
            {pct}<span className="text-sm font-normal">%</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Consistency</p>
        </motion.div>

        {/* Total drill time */}
        <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          <Clock className="h-4 w-4 text-[oklch(0.78_0.16_75)]" />
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {Math.round(totalLogicalMins + totalLinguisticMins)}
            <span className="text-sm font-normal text-muted-foreground">m</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Drill Time</p>
        </motion.div>
      </div>

      {/* Day-by-day calendar */}
      <motion.div variants={fadeUp} className="surface-card p-5">
        <p className="mb-1 text-sm font-semibold text-foreground">Daily Breakdown</p>
        <p className="mb-4 text-xs text-muted-foreground">Each day shows logical, linguistic and reading completion.</p>
        <div className="grid grid-cols-7 gap-2">
          {data.weekly_daily_breakdown.map((day) => (
            <DayCard key={day.date} day={day} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[oklch(0.78_0.16_75)]" />
            <span className="text-[10px] text-muted-foreground">Logical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[oklch(0.65_0.15_168)]" />
            <span className="text-[10px] text-muted-foreground">Linguistic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[oklch(0.68_0.17_145)]" />
            <span className="text-[10px] text-muted-foreground">Reading</span>
          </div>
        </div>
      </motion.div>

      {/* Drill time split */}
      <motion.div variants={fadeUp} className="surface-card p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Time Breakdown This Week</p>
        <div className="flex flex-col gap-4">
          {/* Logical */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Logical Reasoning</p>
              <p className="text-xs font-semibold text-[oklch(0.65_0.12_75)]">
                {Math.round(totalLogicalMins)}m
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-[oklch(0.78_0.16_75)]"
                initial={{ width: 0 }}
                animate={{ width: totalLogicalMins + totalLinguisticMins > 0
                  ? `${(totalLogicalMins / (totalLogicalMins + totalLinguisticMins)) * 100}%`
                  : "0%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          {/* Linguistic */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Linguistic Reasoning</p>
              <p className="text-xs font-semibold text-[oklch(0.55_0.14_168)]">
                {Math.round(totalLinguisticMins)}m
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-[oklch(0.65_0.15_168)]"
                initial={{ width: 0 }}
                animate={{ width: totalLogicalMins + totalLinguisticMins > 0
                  ? `${(totalLinguisticMins / (totalLogicalMins + totalLinguisticMins)) * 100}%`
                  : "0%" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={fadeUp}
        className="surface-card flex items-start gap-4 border border-[oklch(0.65_0.15_168)]/20 bg-[oklch(0.65_0.15_168)]/5 p-5"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)]/15">
          <Trophy className="h-4 w-4 text-[oklch(0.55_0.15_168)]" />
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.50_0.14_168)]">
            <TrendingUp className="h-4 w-4" />
            Consistency Score
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {childName} completed all targets on {data.days_fully_compliant} of {data.total_days_logged} days this week
            {pct >= 70
              ? " — great consistency! Keep encouraging daily practice."
              : " — there's room to improve. Try setting a daily reminder together."}
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
}

/* ─── Fallback: mock metrics (used when studentId is unknown) */
function MockMetricsView({ child }: { child: Child }) {
  const { metrics, summary } = child.progress;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">
      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Week-over-Week Progress
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Comparing this week&apos;s performance with last week for {child.name}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {metrics.map((m) => {
          const pct = m.lastWeek === 0
            ? 100
            : Math.round(((m.thisWeek - m.lastWeek) / m.lastWeek) * 100);
          const improved = pct >= 0;
          const thisWeekBar = Math.min((m.thisWeek / m.max) * 100, 100);
          const lastWeekBar = Math.min((m.lastWeek / m.max) * 100, 100);

          return (
            <motion.div key={m.label} variants={fadeUp} className="surface-card flex flex-col gap-4 p-5">
              <p className="text-sm font-semibold text-foreground">{m.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">This Week</p>
                  <p className="mt-0.5 text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    {m.thisWeek}<span className="ml-1 text-sm font-normal text-muted-foreground">{m.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Last Week</p>
                  <p className="mt-0.5 text-lg font-semibold text-muted-foreground">
                    {m.lastWeek}<span className="ml-1 text-xs font-normal">{m.unit}</span>
                  </p>
                </div>
              </div>
              <div className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold ${
                improved
                  ? "bg-[oklch(0.93_0.06_145)] text-[oklch(0.40_0.14_145)]"
                  : "bg-[oklch(0.95_0.07_25)] text-[oklch(0.50_0.18_25)]"
              }`}>
                {improved ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {improved ? "+" : ""}{pct}% {improved ? "increase" : "decrease"}
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={`h-full rounded-full ${m.color === "brand" ? "bg-[oklch(0.65_0.15_168)]" : "bg-[oklch(0.78_0.16_75)]"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${thisWeekBar}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-muted-foreground/30"
                    initial={{ width: 0 }}
                    animate={{ width: `${lastWeekBar}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        variants={fadeUp}
        className="surface-card flex items-start gap-4 border border-[oklch(0.65_0.15_168)]/20 bg-[oklch(0.65_0.15_168)]/5 p-5"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)]/15">
          <Trophy className="h-4 w-4 text-[oklch(0.55_0.15_168)]" />
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.50_0.14_168)]">
            <TrendingUp className="h-4 w-4" />
            Overall Improvement
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Progress Section ───────────────────────────────────── */
export function ProgressSection({ child, studentId }: { child: Child; studentId: number }) {
  const [compliance, setCompliance] = useState<WeeklyCompliance | null>(null);

  useEffect(() => {
    if (Number.isNaN(studentId)) return;
    getWeeklyCompliance(studentId)
      .then(setCompliance)
      .catch(() => {});
  }, [studentId]);

  if (compliance) {
    return <ComplianceView data={compliance} childName={child.name.split(" ")[0]} />;
  }

  return <MockMetricsView child={child} />;
}
