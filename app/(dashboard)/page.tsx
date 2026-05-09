"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HomeIcon, Brain, BookOpen, BarChart3, MessageSquare, CheckCircle2 } from "lucide-react";
import { children, type SectionKey } from "@/lib/dashboard-data";
import { HomeSection }        from "@/components/dashboard/home-section";
import { MentalDrillSection } from "@/components/dashboard/mental-drill-section";
import { ProgressSection }    from "@/components/dashboard/progress-section";
import { ReadingSection }     from "@/components/dashboard/reading-section";
import { MessagesSection }    from "@/components/dashboard/messages-section";
import { PlaceholderSection } from "@/components/dashboard/placeholder-section";

/* ─── Section tab config ─────────────────────────────────── */
const sections: { key: SectionKey; icon: React.ElementType; label: string }[] = [
  { key: "home",         icon: HomeIcon,       label: "Home" },
  { key: "mental-drill", icon: Brain,          label: "Mental Drill" },
  { key: "reading",      icon: BookOpen,       label: "Reading" },
  { key: "progress",     icon: BarChart3,      label: "Progress" },
  { key: "messages",     icon: MessageSquare,  label: "Messages" },
];

/* ─── Animation variants ─────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ─── Greeting ───────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: "Good morning",   emoji: "🌤️" };
  if (h >= 12 && h < 17) return { text: "Good afternoon", emoji: "☀️" };
  if (h >= 17 && h < 21) return { text: "Good evening",   emoji: "🌇" };
  return                         { text: "Good night",     emoji: "🌙" };
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const { text, emoji } = getGreeting();
  const [activeChildId, setActiveChildId] = useState(children[0].id);
  const [activeSection, setActiveSection] = useState<SectionKey>("home");

  const child = children.find((c) => c.id === activeChildId) ?? children[0];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pt-28 pb-14 md:px-8">

      {/* Greeting */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-8">
        <motion.p variants={fadeUp} className="mb-0.5 text-sm font-medium text-brand">
          {text} {emoji}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="text-2xl font-semibold text-foreground md:text-3xl"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Welcome, Mr. Okafor
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1 text-sm text-muted-foreground">
          Select a child to view their dashboard.
        </motion.p>
      </motion.div>

      {/* ── Child tabs ─────────────────────────────────────── */}
      <div className="mb-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select Child
        </p>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {children.map((c) => {
            const isActive = c.id === activeChildId;
            return (
              <button
                key={c.id}
                onClick={() => { setActiveChildId(c.id); setActiveSection("home"); }}
                className={`relative flex min-w-[220px] items-center gap-4 rounded-xl border p-5 text-left transition-all ${
                  isActive
                    ? "border-[oklch(0.65_0.15_168)] bg-card shadow-[var(--shadow-card-hover)]"
                    : "border-border bg-card hover:border-[oklch(0.65_0.15_168)]/40 hover:shadow-[var(--shadow-card)]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="child-active-bg"
                    className="absolute inset-0 rounded-xl bg-[oklch(0.65_0.15_168)]/5"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white">
                  {c.initials}
                  {isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] ring-2 ring-card">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </div>
                <div className="relative min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.grade}</p>
                  <span className={`mt-1.5 inline-block ${c.tagColor === "amber" ? "badge-amber" : "badge-brand"}`}>
                    {c.level}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section tabs ───────────────────────────────────── */}
      <div className="mb-8 flex gap-1.5 overflow-x-auto rounded-2xl bg-muted p-1.5">
        {sections.map(({ key, icon: Icon, label }) => {
          const isActive = activeSection === key;
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`relative flex flex-1 min-w-max items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-white" : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="section-pill"
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

      {/* ── Section content ────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeChildId}-${activeSection}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {activeSection === "home"         && <HomeSection        child={child} />}
          {activeSection === "mental-drill" && <MentalDrillSection child={child} />}
          {activeSection === "reading"      && <ReadingSection     child={child} />}
          {activeSection === "progress"     && <ProgressSection    child={child} />}
          {activeSection === "messages"     && <MessagesSection    child={child} />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
