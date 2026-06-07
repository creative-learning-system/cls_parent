"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Activity, Brain, BookOpen, ClipboardList } from "lucide-react";
import { getActivityLog, type ActivityLog, type ActivityEntry } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeDate } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
};

function typeConfig(type: string) {
  switch (type) {
    case "drill":
      return {
        icon: <Brain className="h-4 w-4 text-[oklch(0.55_0.14_168)]" />,
        bg:   "bg-[oklch(0.65_0.15_168)]/10",
        badge: "bg-[oklch(0.65_0.15_168)]/10 text-[oklch(0.50_0.14_168)]",
        label: "Drill",
      };
    case "reflection":
      return {
        icon: <BookOpen className="h-4 w-4 text-[oklch(0.45_0.14_145)]" />,
        bg:   "bg-[oklch(0.93_0.06_145)]/40",
        badge: "bg-[oklch(0.93_0.06_145)] text-[oklch(0.40_0.14_145)]",
        label: "Reflection",
      };
    case "pretest":
      return {
        icon: <ClipboardList className="h-4 w-4 text-[oklch(0.55_0.12_75)]" />,
        bg:   "bg-[oklch(0.95_0.07_75)]/40",
        badge: "bg-[oklch(0.95_0.07_75)] text-[oklch(0.50_0.12_75)]",
        label: "Pretest",
      };
    default:
      return {
        icon: <Activity className="h-4 w-4 text-muted-foreground" />,
        bg:   "bg-muted/40",
        badge: "bg-muted text-muted-foreground",
        label: type,
      };
  }
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const cfg = typeConfig(entry.type);
  return (
    <motion.div variants={fadeUp} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-foreground">{entry.title}</p>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        {entry.description && (
          <p className="text-xs text-muted-foreground">{entry.description}</p>
        )}
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          {formatRelativeDate(entry.timestamp)}
          {entry.score ? ` · ${entry.score}` : ""}
        </p>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="surface-card p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityLogCard({ studentId }: { studentId: number }) {
  const [log, setLog]         = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [retry, setRetry]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getActivityLog(studentId)
      .then((d)  => { if (!cancelled) setLog(d); })
      .catch(()  => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  if (loading) return <LoadingSkeleton />;
  if (error) return null;

  const activities = log?.activities ?? [];

  if (activities.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center gap-2 py-10 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No recent activity yet.</p>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="surface-card p-5">
      <div className="mb-1 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
        <p className="text-sm font-semibold text-foreground">Recent Activity</p>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">Drills, reflections and pretests — most recent first.</p>
      {activities.map((entry) => (
        <ActivityRow key={entry.id} entry={entry} />
      ))}
    </motion.div>
  );
}
