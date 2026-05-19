"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HomeIcon, Brain, BookOpen, BarChart3, MessageSquare, CheckCircle2 } from "lucide-react";
import { children as mockChildren, type Child, type SectionKey } from "@/lib/dashboard-data";
import { HomeSection }        from "@/components/dashboard/home-section";
import { MentalDrillSection } from "@/components/dashboard/mental-drill-section";
import { ProgressSection }    from "@/components/dashboard/progress-section";
import { ReadingSection }     from "@/components/dashboard/reading-section";
import { MessagesSection }    from "@/components/dashboard/messages-section";
import { getDashboard, type DashboardChild } from "@/lib/api";
import { getUser } from "@/lib/auth";

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

/* ─── Map API child to UI Child ──────────────────────────── */
function mapApiChild(apiChild: DashboardChild, index: number): Child {
  const nameParts = apiChild.full_name.trim().split(" ");
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : apiChild.full_name.slice(0, 2).toUpperCase();

  const compliance = apiChild.today_compliance;
  const targetsMetCount = [
    compliance.LogicalTargetMet,
    compliance.LinguisticTargetMet,
    compliance.ReadingReflectionCompleted,
  ].filter(Boolean).length;

  const learningStatus = targetsMetCount === 3
    ? "All targets met"
    : targetsMetCount > 0
    ? "In progress"
    : "No activity today";

  const notifications: Child["notifications"] = apiChild.recent_achievements.map((a) => ({
    color: a.ChangeType === "Promotion" ? "success" : "amber",
    title: `${a.ChangeType} to Level ${a.NewLevel}`,
    sub: `Drill type ${a.DrillTypeID} · ${new Date(a.ChangedAt).toLocaleDateString()}`,
  }));

  if (!compliance.LogicalTargetMet) {
    notifications.push({
      color: "amber",
      title: "Logical reasoning target not met",
      sub: "Encourage your child to complete today's logical drills.",
    });
  }
  if (!compliance.LinguisticTargetMet) {
    notifications.push({
      color: "amber",
      title: "Linguistic reasoning target not met",
      sub: "Encourage your child to complete today's linguistic drills.",
    });
  }

  const primaryLevel = apiChild.reasoning_levels[0];

  // Merge with a mock child if one exists at the same index (for drills, messages, etc.)
  const mock = mockChildren[index] ?? mockChildren[0];

  return {
    ...mock,
    id: String(apiChild.student_id),
    initials,
    name: apiChild.full_name,
    grade: apiChild.class_info,
    level: primaryLevel?.LevelName ?? mock.level,
    learningStatus,
    notifications,
    stats: [
      { label: "Logical target",    value: compliance.LogicalTargetMet    ? "Met" : "Pending", unit: "today" },
      { label: "Linguistic target", value: compliance.LinguisticTargetMet ? "Met" : "Pending", unit: "today" },
      { label: "Reading reflection",value: compliance.ReadingReflectionCompleted ? "Done" : "Pending", unit: "today", highlight: compliance.ReadingReflectionCompleted },
    ],
  };
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const { text, emoji } = getGreeting();

  const [displayChildren, setDisplayChildren] = useState<Child[]>(mockChildren);
  const [activeChildId, setActiveChildId]     = useState(mockChildren[0].id);
  const [activeSection, setActiveSection]     = useState<SectionKey>("home");
  const [parentName, setParentName]           = useState("Parent");

  useEffect(() => {
    const user = getUser();
    if (user?.full_name) {
      const lastName = user.full_name.trim().split(" ").at(-1) ?? user.full_name;
      setParentName(lastName);
    }

    getDashboard()
      .then((data) => {
        if (data.children.length > 0) {
          const mapped = data.children.map((c, i) => mapApiChild(c, i));
          setDisplayChildren(mapped);
          setActiveChildId(mapped[0].id);
        }
      })
      .catch(() => {
        // Keep mock data on API failure
      });
  }, []);

  const child = displayChildren.find((c) => c.id === activeChildId) ?? displayChildren[0];
  const studentId = Number(child.id);

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
          Welcome, {parentName}
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
          {displayChildren.map((c) => {
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
          {activeSection === "home"         && <HomeSection        child={child} studentId={studentId} />}
          {activeSection === "mental-drill" && <MentalDrillSection child={child} studentId={studentId} />}
          {activeSection === "reading"      && <ReadingSection     child={child} studentId={studentId} />}
          {activeSection === "progress"     && <ProgressSection    child={child} studentId={studentId} />}
          {activeSection === "messages"     && <MessagesSection    child={child} />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
