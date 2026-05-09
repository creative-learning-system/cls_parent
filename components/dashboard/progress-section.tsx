"use client";

import { motion, type Variants } from "framer-motion";
import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import type { Child } from "@/lib/dashboard-data";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

export function ProgressSection({ child }: { child: Child }) {
  const { metrics, summary } = child.progress;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Week-over-Week Progress
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Comparing this week&apos;s performance with last week for {child.name}
        </p>
      </motion.div>

      {/* Metric cards */}
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
                    {m.thisWeek}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">{m.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Last Week</p>
                  <p className="mt-0.5 text-lg font-semibold text-muted-foreground">
                    {m.lastWeek}
                    <span className="ml-1 text-xs font-normal">{m.unit}</span>
                  </p>
                </div>
              </div>

              {/* % change badge */}
              <div className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold ${
                improved
                  ? "bg-[oklch(0.93_0.06_145)] text-[oklch(0.40_0.14_145)]"
                  : "bg-[oklch(0.95_0.07_25)] text-[oklch(0.50_0.18_25)]"
              }`}>
                {improved
                  ? <TrendingUp   className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />
                }
                {improved ? "+" : ""}{pct}% {improved ? "increase" : "decrease"}
              </div>

              {/* Bars */}
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
            Overall Improvement
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
