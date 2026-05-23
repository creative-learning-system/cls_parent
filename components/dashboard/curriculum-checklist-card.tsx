"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { BookMarked, ChevronDown, CheckCircle2, Circle, Award, RefreshCw } from "lucide-react";
import {
  getCurriculumChecklist,
  type CurriculumChecklist,
  type CurriculumSubject,
  type CurriculumTopic,
} from "@/lib/api";
import { fetchCached } from "@/lib/cache";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

const statusConfig = {
  Mastered: {
    badge:       "bg-[oklch(0.93_0.06_145)] text-[oklch(0.40_0.14_145)]",
    icon:        <CheckCircle2 className="h-4 w-4 shrink-0 text-[oklch(0.55_0.14_145)]" />,
    bar:         "bg-[oklch(0.65_0.15_168)]",
    scoreColor:  "text-[oklch(0.50_0.14_168)]",
  },
  Passed: {
    badge:       "bg-[oklch(0.95_0.07_75)] text-[oklch(0.50_0.12_75)]",
    icon:        <CheckCircle2 className="h-4 w-4 shrink-0 text-[oklch(0.65_0.12_75)]" />,
    bar:         "bg-[oklch(0.78_0.16_75)]",
    scoreColor:  "text-[oklch(0.55_0.12_75)]",
  },
  "Not Started": {
    badge:       "bg-muted text-muted-foreground",
    icon:        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />,
    bar:         "bg-muted-foreground/20",
    scoreColor:  "text-muted-foreground",
  },
} as const;

function TopicRow({ topic }: { topic: CurriculumTopic }) {
  const cfg = statusConfig[topic.status];
  const scoreNum = topic.score !== "N/A" ? parseFloat(topic.score) : 0;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0">
      {cfg.icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{topic.topic_name}</p>
          <span className="text-[9px] font-mono text-muted-foreground/70">{topic.topic_code}</span>
        </div>
        {topic.score !== "N/A" && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className={`h-full rounded-full ${cfg.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${scoreNum}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {topic.score !== "N/A" && (
          <span className={`text-xs font-bold ${cfg.scoreColor}`}>{topic.score}</span>
        )}
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
          {topic.status}
        </span>
      </div>
    </div>
  );
}

function SubjectAccordion({ subject, defaultOpen }: { subject: CurriculumSubject; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div variants={fadeUp} className="surface-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.65_0.15_168)]/10">
          <BookMarked className="h-4 w-4 text-[oklch(0.55_0.14_168)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{subject.subject_name}</p>
          <p className="text-xs text-muted-foreground">
            {subject.topics.length} topic{subject.topics.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {subject.mastery_count > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-[oklch(0.93_0.06_145)] px-2.5 py-1">
              <Award className="h-3 w-3 text-[oklch(0.45_0.14_145)]" />
              <span className="text-[10px] font-bold text-[oklch(0.45_0.14_145)]">
                {subject.mastery_count} mastered
              </span>
            </div>
          )}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChevronDown
              className={`h-4 w-4 transition-colors ${open ? "text-[oklch(0.65_0.15_168)]" : "text-muted-foreground"}`}
            />
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
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 pb-3 pt-1">
              {subject.topics.map((topic) => (
                <TopicRow key={topic.topic_id} topic={topic} />
              ))}
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
      {[1, 2, 3].map((i) => (
        <div key={i} className="surface-card p-5 flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CurriculumChecklistCard({ studentId }: { studentId: number }) {
  const [data, setData]       = useState<CurriculumChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [retry, setRetry]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchCached(`c${studentId}:curriculum`, () => getCurriculumChecklist(studentId))
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="surface-card flex flex-col items-center gap-3 py-12 text-center">
        <BookMarked className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Could not load curriculum.</p>
        <button
          onClick={() => setRetry((r) => r + 1)}
          className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  const totalMastered = data.subject_progress.reduce((s, sub) => s + sub.mastery_count, 0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-3">

      {/* Summary banner */}
      <motion.div
        variants={fadeUp}
        className="surface-card border border-[oklch(0.65_0.15_168)]/20 bg-[oklch(0.65_0.15_168)]/5 flex items-center gap-3 p-4"
      >
        <Award className="h-5 w-5 shrink-0 text-[oklch(0.55_0.14_168)]" />
        <p className="text-sm text-foreground">
          <span className="font-bold text-[oklch(0.50_0.14_168)]">{totalMastered}</span>{" "}
          topic{totalMastered !== 1 ? "s" : ""} mastered across{" "}
          <span className="font-bold">{data.subject_progress.length}</span>{" "}
          subject{data.subject_progress.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {data.subject_progress.map((subject, i) => (
        <SubjectAccordion key={subject.subject_id} subject={subject} defaultOpen={i === 0} />
      ))}

    </motion.div>
  );
}
