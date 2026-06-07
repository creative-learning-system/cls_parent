"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  TrendingUp, TrendingDown, Trophy, CheckCircle2, XCircle,
  Clock, Target, BarChart3, BookMarked, CalendarDays, ClipboardList, Activity,
} from "lucide-react";
import type { Child } from "@/lib/dashboard-data";
import { getWeeklyCompliance, type WeeklyCompliance, type WeeklyComplianceDay } from "@/lib/api";
import { fetchCached } from "@/lib/cache";
import { Skeleton } from "@/components/ui/skeleton";
import { AcademicProfileCard }       from "@/components/dashboard/academic-profile-card";
import { CurriculumChecklistCard }   from "@/components/dashboard/curriculum-checklist-card";
import { ReasoningAnalyticsCard }    from "@/components/dashboard/reasoning-analytics-card";
import { ComplianceHistoryCard }     from "@/components/dashboard/compliance-history-card";
import { PretestsCard }              from "@/components/dashboard/pretests-card";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

type ProgressTab = "weekly" | "academic" | "curriculum" | "analytics" | "history" | "pretests";

const tabs: { key: ProgressTab; label: string; icon: React.ElementType }[] = [
  { key: "weekly",     label: "Weekly",     icon: BarChart3      },
  { key: "academic",   label: "Academic",   icon: Trophy         },
  { key: "curriculum", label: "Curriculum", icon: BookMarked     },
  { key: "analytics",  label: "Analytics",  icon: Activity       },
  { key: "history",    label: "History",    icon: CalendarDays   },
  { key: "pretests",   label: "Pretests",   icon: ClipboardList  },
];

/* ─── Day card ───────────────────────────────────────────── */
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

      {totalMins > 0 && (
        <p className="text-[9px] font-medium text-muted-foreground">{totalMins}m</p>
      )}
    </motion.div>
  );
}

/* ─── Weekly compliance view ─────────────────────────────── */
function ComplianceView({ data, childName }: { data: WeeklyCompliance; childName: string }) {
  const pct = Math.round(data.compliance_consistency_percentage);
  const improved = pct >= 70;

  const totalLogicalMins   = data.weekly_daily_breakdown.reduce((s, d) => s + d.logical_time_spent_mins,   0);
  const totalLinguisticMins = data.weekly_daily_breakdown.reduce((s, d) => s + d.linguistic_time_spent_mins, 0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Weekly Progress
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{childName}&apos;s last 7 days at a glance</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          <Target className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {data.days_fully_compliant}
            <span className="text-sm font-normal text-muted-foreground">/{data.total_days_logged}</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Days</p>
        </motion.div>

        <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          {improved
            ? <TrendingUp   className="h-4 w-4 text-[oklch(0.55_0.14_145)]" />
            : <TrendingDown className="h-4 w-4 text-[oklch(0.55_0.18_25)]" />
          }
          <p
            className={`text-2xl font-bold ${improved ? "text-[oklch(0.45_0.14_145)]" : "text-[oklch(0.50_0.18_25)]"}`}
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {pct}<span className="text-sm font-normal">%</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Consistency</p>
        </motion.div>

        <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-1 p-4 text-center">
          <Clock className="h-4 w-4 text-[oklch(0.78_0.16_75)]" />
          <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            {Math.round(totalLogicalMins + totalLinguisticMins)}
            <span className="text-sm font-normal text-muted-foreground">m</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Drill Time</p>
        </motion.div>
      </div>

      {/* Calendar */}
      <motion.div variants={fadeUp} className="surface-card p-5">
        <p className="mb-1 text-sm font-semibold text-foreground">Daily Breakdown</p>
        <p className="mb-4 text-xs text-muted-foreground">Each day shows logical, linguistic and reading completion.</p>
        <div className="grid grid-cols-7 gap-2">
          {data.weekly_daily_breakdown.map((day) => (
            <DayCard key={day.date} day={day} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4">
          {[
            { color: "bg-[oklch(0.78_0.16_75)]",  label: "Logical" },
            { color: "bg-[oklch(0.65_0.15_168)]",  label: "Linguistic" },
            { color: "bg-[oklch(0.68_0.17_145)]",  label: "Reading" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Time split */}
      <motion.div variants={fadeUp} className="surface-card p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Time Breakdown This Week</p>
        <div className="flex flex-col gap-4">
          {[
            { label: "Logical Reasoning",   mins: totalLogicalMins,    color: "bg-[oklch(0.78_0.16_75)]",  textColor: "text-[oklch(0.65_0.12_75)]" },
            { label: "Linguistic Reasoning", mins: totalLinguisticMins, color: "bg-[oklch(0.65_0.15_168)]", textColor: "text-[oklch(0.55_0.14_168)]" },
          ].map(({ label, mins, color, textColor }, i) => (
            <div key={label}>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className={`text-xs font-semibold ${textColor}`}>{Math.round(mins)}m</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={`h-full rounded-full ${color}`}
                  initial={{ width: 0 }}
                  animate={{
                    width: totalLogicalMins + totalLinguisticMins > 0
                      ? `${(mins / (totalLogicalMins + totalLinguisticMins)) * 100}%`
                      : "0%",
                  }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
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
            <TrendingUp className="h-4 w-4" /> Consistency Score
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

/* ─── Weekly compliance skeleton ─────────────────────────── */
function WeeklyComplianceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="surface-card p-5">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3.5 w-56" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="surface-card flex flex-col items-center gap-2 p-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        ))}
      </div>
      <div className="surface-card p-5">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-border p-3">
              <Skeleton className="h-2.5 w-5" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Progress Section ───────────────────────────────────── */
export function ProgressSection({ child, studentId }: { child: Child; studentId: number }) {
  const [activeTab, setActiveTab]         = useState<ProgressTab>("weekly");
  const [compliance, setCompliance]       = useState<WeeklyCompliance | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  useEffect(() => {
    if (Number.isNaN(studentId)) return;
    let cancelled = false;
    setLoadingWeekly(true);
    setCompliance(null);
    fetchCached(`c${studentId}:weekly-compliance`, () => getWeeklyCompliance(studentId))
      .then((d)  => { if (!cancelled) setCompliance(d); })
      .catch(()  => {})
      .finally(() => { if (!cancelled) setLoadingWeekly(false); });
    return () => { cancelled = true; };
  }, [studentId]);

  const firstName = child.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">

      {/* Tab bar */}
      <div className="flex gap-1.5 rounded-2xl bg-muted p-1.5">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex flex-1 min-w-max items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-white" : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="progress-tab-pill"
                  className="absolute inset-0 rounded-xl gradient-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative h-3.5 w-3.5" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "weekly" && (
            loadingWeekly
              ? <WeeklyComplianceSkeleton />
              : compliance
                ? <ComplianceView data={compliance} childName={firstName} />
                : (
                  <div className="surface-card flex flex-col items-center gap-3 py-12 text-center">
                    <Trophy className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Could not load weekly compliance data.</p>
                  </div>
                )
          )}
          {activeTab === "academic" && (
            <AcademicProfileCard studentId={studentId} childName={child.name} />
          )}
          {activeTab === "curriculum" && (
            <CurriculumChecklistCard studentId={studentId} />
          )}
          {activeTab === "analytics" && (
            <ReasoningAnalyticsCard studentId={studentId} childName={child.name} />
          )}
          {activeTab === "history" && (
            <ComplianceHistoryCard studentId={studentId} childName={child.name} />
          )}
          {activeTab === "pretests" && (
            <PretestsCard studentId={studentId} childName={child.name} />
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
