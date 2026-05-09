"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Brain, CheckCircle2, Clock, TrendingUp, TrendingDown, Heart, Calendar } from "lucide-react";
import type { Child, DrillSession } from "@/lib/dashboard-data";

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

/* ─── Score colour ───────────────────────────────────────── */
function scoreColor(score: number, total: number) {
  const pct = score / total;
  if (pct >= 0.8) return "text-[oklch(0.55_0.14_168)]";
  if (pct >= 0.5) return "text-[oklch(0.65_0.12_75)]";
  return "text-[oklch(0.55_0.18_25)]";
}

/* ─── Single drill row ───────────────────────────────────── */
function DrillRow({ session }: { session: DrillSession }) {
  const pct = session.score / session.total;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex items-center gap-3 min-w-0">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[oklch(0.65_0.15_168)]" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{session.drillName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{session.time}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-bold ${scoreColor(session.score, session.total)}`}>
          {session.score}/{session.total}
        </span>
        <span className="rounded-full bg-[oklch(0.65_0.15_168)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
          Completed
        </span>
      </div>
    </div>
  );
}

/* ─── Today's drills ─────────────────────────────────────── */
function TodayDrills({ child, sessions }: { child: Child; sessions: DrillSession[] }) {
  const firstName = child.name.split(" ")[0];
  const todaySessions = sessions.filter((s) => s.date === "Today");

  const logicSessions      = todaySessions.filter((s) => s.category === "logic");
  const linguisticSessions = todaySessions.filter((s) => s.category === "linguistic");

  if (todaySessions.length === 0) {
    return (
      <motion.div variants={fadeUp} className="surface-card flex flex-col items-center gap-2 py-10 text-center">
        <Brain className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No drills completed today yet.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {logicSessions.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Logical Reasoning</p>
          <p className="mb-4 text-xs text-muted-foreground">Completed today</p>
          <div className="flex flex-col gap-2">
            {logicSessions.map((s) => <DrillRow key={s.id} session={s} />)}
          </div>
        </motion.div>
      )}
      {linguisticSessions.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <p className="mb-0.5 text-sm font-semibold text-foreground">Linguistic Reasoning</p>
          <p className="mb-4 text-xs text-muted-foreground">Completed today</p>
          <div className="flex flex-col gap-2">
            {linguisticSessions.map((s) => <DrillRow key={s.id} session={s} />)}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Past activity grouped by date ─────────────────────── */
function PastActivity({ sessions }: { sessions: DrillSession[] }) {
  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, { date: string; dateLabel: string; sessions: DrillSession[] }>();
    for (const s of sessions) {
      if (!map.has(s.date)) map.set(s.date, { date: s.date, dateLabel: s.dateLabel, sessions: [] });
      map.get(s.date)!.sessions.push(s);
    }
    return Array.from(map.values());
  }, [sessions]);

  if (grouped.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center gap-2 py-10 text-center">
        <Calendar className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No activity in this period.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {grouped.map((group) => {
        const logic      = group.sessions.filter((s) => s.category === "logic");
        const linguistic = group.sessions.filter((s) => s.category === "linguistic");
        return (
          <motion.div key={group.date} variants={fadeUp} className="surface-card overflow-hidden">
            {/* Date header */}
            <div className="border-b border-border px-5 py-3">
              <p className="text-sm font-semibold text-foreground capitalize">{group.date}</p>
              <p className="text-xs text-muted-foreground">{group.dateLabel}</p>
            </div>
            {/* Two columns */}
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:divide-x divide-border">
              <div className="p-4">
                {logic.length > 0 ? (
                  <>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[oklch(0.65_0.12_75)]">
                      Logical Reasoning
                    </p>
                    <div className="flex flex-col gap-2">
                      {logic.map((s) => <DrillRow key={s.id} session={s} />)}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground/50 italic">No logical drills</p>
                )}
              </div>
              <div className="p-4">
                {linguistic.length > 0 ? (
                  <>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[oklch(0.55_0.14_168)]">
                      Linguistic Reasoning
                    </p>
                    <div className="flex flex-col gap-2">
                      {linguistic.map((s) => <DrillRow key={s.id} session={s} />)}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground/50 italic">No linguistic drills</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Mental Drill Section ───────────────────────────────── */
export function MentalDrillSection({ child }: { child: Child }) {
  const [period, setPeriod] = useState<PeriodFilter>("week");
  const firstName = child.name.split(" ")[0];

  // Periods include all sessions up to and including the selected period
  const periodOrder: PeriodFilter[] = ["today", "week", "month", "all"];
  const periodIndex = periodOrder.indexOf(period);

  const filteredSessions = useMemo(() => {
    return child.drillActivity.filter((s) => {
      const sIndex = periodOrder.indexOf(s.period);
      return sIndex <= periodIndex;
    });
  }, [child.drillActivity, periodIndex]);

  // Today's sessions always shown at top
  const todaySessions = child.drillActivity.filter((s) => s.period === "today");

  // Past = everything except today
  const pastSessions = filteredSessions.filter((s) => s.date !== "Today");

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

      {/* Notifications */}
      {child.notifications.map((note, i) => (
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
            ? <TrendingUp  className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.14_145)]" />
            : <Heart       className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.65_0.12_75)]" />
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
      <TodayDrills child={child} sessions={todaySessions} />

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

        {/* Past sessions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <PastActivity sessions={pastSessions} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

    </motion.div>
  );
}
