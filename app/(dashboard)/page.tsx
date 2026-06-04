"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HomeIcon, Brain, BookOpen, BarChart3, MessageSquare, CheckCircle2, Users, RefreshCw } from "lucide-react";
import { type SectionKey, type Child } from "@/lib/dashboard-data";
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

/* ─── Map API child → UI Child (NO mock data) ────────────── */
function mapApiChild(apiChild: DashboardChild): Child {
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
  const tag = apiChild.class_info.trim().split(" ")[0] ?? "Student";

  return {
    id:             String(apiChild.student_id),
    initials,
    name:           apiChild.full_name,
    grade:          apiChild.class_info,
    level:          primaryLevel?.LevelName ?? apiChild.class_info,
    tag,
    tagColor:       "brand",
    subjects:       [],
    learningStatus,
    stats: [
      { label: "Logical target",     value: compliance.LogicalTargetMet              ? "Met"  : "Pending", unit: "today" },
      { label: "Linguistic target",  value: compliance.LinguisticTargetMet           ? "Met"  : "Pending", unit: "today" },
      { label: "Reading reflection", value: compliance.ReadingReflectionCompleted    ? "Done" : "Pending", unit: "today", highlight: compliance.ReadingReflectionCompleted },
    ],
    notifications,
    progress:       { summary: "", metrics: [] },
    drillCategories: [],
    drillActivity:   [],
    reading:         [],
    teachers:        [],
    messages:        {},
  };
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Home() {
  const { text, emoji } = getGreeting();

  const [children, setChildren]           = useState<Child[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [refreshing, setRefreshing]       = useState(false);
  const [activeChildId, setActiveChildId] = useState<string>("");
  const [activeSection, setActiveSection] = useState<SectionKey>("home");
  const [parentName, setParentName]       = useState("Parent");

  function fetchDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    getDashboard()
      .then((data) => {
        const list = Array.isArray(data?.children) ? data.children : [];
        if (list.length > 0) {
          const mapped = list.map(mapApiChild);
          setChildren(mapped);
          setActiveChildId((prev) => prev || mapped[0].id);
        } else {
          setChildren([]);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard";
        setError(msg);
        console.error("[dashboard] fetchDashboard error:", err);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    const user = getUser();
    if (user?.full_name) {
      const lastName = user.full_name.trim().split(" ").at(-1) ?? user.full_name;
      setParentName(lastName);
    }
    fetchDashboard();
  }, []);

  const child = children.find((c) => c.id === activeChildId) ?? children[0];
  const studentId = child ? Number(child.id) : NaN;

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
          {loading
            ? "Loading your children…"
            : error
            ? "Could not load children — see error below."
            : children.length === 0
            ? "No children linked to your account."
            : "Select a child to view their dashboard."}
        </motion.p>
      </motion.div>

      {/* ── Child tabs ─────────────────────────────────────── */}
      <div className="mb-10">
        {(loading || children.length > 0) && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Child
          </p>
        )}

        {loading ? (
          /* Skeleton child cards */
          <div className="flex gap-4 overflow-x-auto pb-1">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex min-w-[220px] items-center gap-4 rounded-xl border border-border bg-card p-5 animate-pulse"
              >
                <div className="h-11 w-11 rounded-full bg-muted" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3.5 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-4 w-12 rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* API error */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex min-h-[40vh] items-center justify-center"
          >
            <div className="flex max-w-sm flex-col items-center gap-5 rounded-2xl border border-destructive/30 bg-card p-10 text-center shadow-[var(--shadow-card)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <RefreshCw className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Could not load children
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{error}</p>
              </div>
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Retrying…" : "Retry"}
              </button>
            </div>
          </motion.div>
        ) : children.length === 0 ? (
          /* No children linked */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex min-h-[40vh] items-center justify-center"
          >
            <div className="flex max-w-sm flex-col items-center gap-5 rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[oklch(0.65_0.15_168)]/10">
                <Users className="h-8 w-8 text-[oklch(0.55_0.14_168)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  No children linked
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Your account doesn&apos;t have any children linked yet. Contact your school administrator to get started.
                </p>
              </div>
              <div className="w-full rounded-xl border border-[oklch(0.65_0.15_168)]/20 bg-[oklch(0.65_0.15_168)]/5 px-4 py-3 text-xs text-muted-foreground">
                If a child was recently linked, tap the button below to check again.
              </div>
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Checking…" : "Check Again"}
              </button>
            </div>
          </motion.div>
        ) : (
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
        )}
      </div>

      {/* ── Section tabs + content (only when a child is selected) ── */}
      {child && (
        <>
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
        </>
      )}

    </div>
  );
}
