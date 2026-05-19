"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { BookOpen, FileText, ChevronDown } from "lucide-react";
import type { Child, ReadingEntry, ReadingPart } from "@/lib/dashboard-data";
import { getReadingReflections } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ─── Single accordion part ──────────────────────────────── */
function AccordionPart({ part, index, childName }: { part: ReadingPart; index: number; childName: string }) {
  const [open, setOpen] = useState(index === 0); // first part open by default

  return (
    <div className={`overflow-hidden rounded-xl border transition-colors ${
      open ? "border-[oklch(0.65_0.15_168)]/30 bg-[oklch(0.65_0.15_168)]/3" : "border-border bg-card"
    }`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
          open ? "bg-[oklch(0.65_0.15_168)] text-white" : "bg-muted text-muted-foreground"
        }`}>
          <FileText className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{part.label}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{part.question}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0"
        >
          <ChevronDown className={`h-4 w-4 transition-colors ${open ? "text-[oklch(0.65_0.15_168)]" : "text-muted-foreground"}`} />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Question */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Question
              </p>
              <p className="mb-4 text-sm text-foreground">{part.question}</p>

              {/* Answer */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {childName}&apos;s Answer
              </p>
              <div className="rounded-xl border border-border bg-muted/50 px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground">{part.answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Single reading entry card ──────────────────────────── */
function ReadingEntryCard({ entry, defaultOpen, childName }: { entry: ReadingEntry; defaultOpen: boolean; childName: string }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div variants={fadeUp} className="surface-card overflow-hidden">
      {/* Entry header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Topic
            </p>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              entry.date === "Today"
                ? "bg-[oklch(0.65_0.15_168)]/10 text-[oklch(0.50_0.14_168)]"
                : "bg-muted text-muted-foreground"
            }`}>
              {entry.date}
            </span>
          </div>
          <h3
            className="mt-1 text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {entry.topic}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {entry.parts.length} question{entry.parts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <ChevronDown className={`h-5 w-5 transition-colors ${open ? "text-[oklch(0.65_0.15_168)]" : "text-muted-foreground"}`} />
        </motion.div>
      </button>

      {/* Parts accordion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="parts"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-border px-6 pb-6 pt-4">
              {entry.parts.map((part, i) => (
                <AccordionPart key={part.id} part={part} index={i} childName={childName} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Reading section ────────────────────────────────────── */
export function ReadingSection({ child, studentId }: { child: Child; studentId: number }) {
  const [entries, setEntries] = useState<ReadingEntry[]>(child.reading);
  const firstName = child.name.split(" ")[0];

  useEffect(() => {
    if (Number.isNaN(studentId)) return;
    getReadingReflections(studentId)
      .then((data) => {
        setEntries(
          data.reflections.map((r) => ({
            id:    String(r.reflection_id),
            topic: r.topic_title,
            date:  formatRelativeDate(r.submitted_at),
            parts: r.parts.map((p) => ({
              id:       String(p.part_number),
              label:    `Part ${p.part_number}`,
              question: p.question,
              answer:   p.answer,
            })),
          })),
        );
      })
      .catch(() => {});
  }, [studentId]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
          <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Reading Understanding
          </h3>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {child.name}&apos;s latest reading and what {firstName} wrote
        </p>
      </motion.div>

      {/* Reading entries */}
      {entries.map((entry, i) => (
        <ReadingEntryCard key={entry.id} entry={entry} defaultOpen={i === 0} childName={firstName} />
      ))}

    </motion.div>
  );
}
