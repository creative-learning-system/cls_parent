"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  HomeIcon,
  Brain,
  BookOpen,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Flame,
  Trophy,
  Send,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Types ──────────────────────────────────────────────── */
type SectionKey = "home" | "mental-drill" | "reading" | "progress" | "messages";

interface Teacher {
  id: string;
  initials: string;
  name: string;
  role: string;
  subject: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface Message {
  id: string;
  from: "teacher" | "parent";
  senderName: string;
  senderInitials: string;
  text: string;
  time: string;
}

interface Child {
  id: string;
  initials: string;
  name: string;
  grade: string;
  level: string;
  tag: string;
  tagColor: "brand" | "amber";
  subjects: string[];
  learningStatus: string;
  stats: { label: string; value: string; unit: string; highlight?: boolean }[];
  notifications: { color: "success" | "amber"; title: string; sub: string }[];
  progress: {
    summary: string;
    metrics: {
      label: string;
      thisWeek: number;
      lastWeek: number;
      unit: string;
      max: number;
      color: "brand" | "amber";
    }[];
  };
  teachers: Teacher[];
  messages: Record<string, Message[]>;
}

/* ─── Mock data ──────────────────────────────────────────── */
const children: Child[] = [
  {
    id: "co",
    initials: "CO",
    name: "Chidera Okafor",
    grade: "JSS 2B",
    level: "Junior Secondary",
    tag: "STEM",
    tagColor: "amber",
    subjects: ["Mathematics", "Basic Science", "Basic Technology"],
    learningStatus: "Consistent Learning",
    stats: [
      { label: "Today's Activity", value: "35",  unit: "minutes" },
      { label: "This Week",        value: "180", unit: "minutes total" },
      { label: "Learning Status",  value: "Consistent", unit: "learning", highlight: true },
    ],
    notifications: [
      { color: "success", title: "Promoted in Order of Operations",  sub: "Category: Logical Reasoning — Great work, keep encouraging Chidera." },
      { color: "amber",   title: "Demoted in Sentence Analysis",     sub: "Category: Linguistic Reasoning — Chidera may need your attention here." },
    ],
    progress: {
      summary: "Chidera is showing great progress this week! Time spent learning increased by 20%, and accuracy improved to 85%. Keep encouraging consistent practice to maintain this positive momentum.",
      metrics: [
        { label: "Time Spent",        thisWeek: 180, lastWeek: 150, unit: "minutes", max: 300, color: "amber" },
        { label: "Accuracy",          thisWeek: 85,  lastWeek: 78,  unit: "%",       max: 100, color: "brand" },
        { label: "Levels Climbed",    thisWeek: 3,   lastWeek: 2,   unit: "levels",  max: 10,  color: "amber" },
        { label: "Lesson Completion", thisWeek: 50,  lastWeek: 40,  unit: "%",       max: 100, color: "brand" },
      ],
    },
    teachers: [
      {
        id: "ma",
        initials: "AA",
        name: "Mrs. Adebayo",
        role: "Class Teacher",
        subject: "Mathematics",
        lastMessage: "Chidera did well in today's quiz!",
        lastTime: "10:30 AM",
        unread: 2,
      },
      {
        id: "ok",
        initials: "OO",
        name: "Mr. Okonkwo",
        role: "Subject Teacher",
        subject: "Basic Science",
        lastMessage: "Please remind Chidera to bring her lab notebook.",
        lastTime: "Yesterday",
        unread: 0,
      },
      {
        id: "ej",
        initials: "EE",
        name: "Mrs. Ejike",
        role: "Subject Teacher",
        subject: "Basic Technology",
        lastMessage: "The project submission is due Friday.",
        lastTime: "Mon",
        unread: 1,
      },
    ],
    messages: {
      ma: [
        { id: "1", from: "teacher", senderName: "Mrs. Adebayo", senderInitials: "AA", text: "Good morning! I wanted to let you know that Chidera did very well in today's Mathematics quiz.", time: "10:15 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "That's wonderful to hear! We've been practising at home every evening.", time: "10:22 AM" },
        { id: "3", from: "teacher", senderName: "Mrs. Adebayo", senderInitials: "AA", text: "It really shows. She scored 18/20. Keep up the great support!", time: "10:30 AM" },
      ],
      ok: [
        { id: "1", from: "teacher", senderName: "Mr. Okonkwo",  senderInitials: "OO", text: "Hello Mr. Okafor. Please remind Chidera to bring her lab notebook to class tomorrow.", time: "Yesterday" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "Noted, I'll make sure she packs it tonight. Thank you for the reminder.", time: "Yesterday" },
      ],
      ej: [
        { id: "1", from: "teacher", senderName: "Mrs. Ejike",   senderInitials: "EE", text: "Good afternoon. Just a reminder that the Basic Technology project is due this Friday.", time: "Mon 2:00 PM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "Thank you for the heads-up. What materials does she need?", time: "Mon 3:15 PM" },
        { id: "3", from: "teacher", senderName: "Mrs. Ejike",   senderInitials: "EE", text: "She needs cardboard, a ruler, and coloured markers. The instructions are in her notebook.", time: "Mon 3:40 PM" },
      ],
    },
  },
  {
    id: "vo",
    initials: "VO",
    name: "Victor Okafor",
    grade: "SS 2 Science",
    level: "Senior Secondary",
    tag: "SENIOR SECONDARY",
    tagColor: "brand",
    subjects: ["Physics", "Chemistry", "Further Maths"],
    learningStatus: "Consistent Learning",
    stats: [
      { label: "Today's Activity", value: "50",  unit: "minutes" },
      { label: "This Week",        value: "210", unit: "minutes total" },
      { label: "Learning Status",  value: "Consistent", unit: "learning", highlight: true },
    ],
    notifications: [
      { color: "success", title: "Promoted in Quadratic Equations", sub: "Category: Algebra — Victor is excelling in Further Maths." },
    ],
    progress: {
      summary: "Victor had a strong week! Time spent increased by 16.7% and lesson completion jumped to 65%. Keep up the great work and focus on maintaining accuracy above 80%.",
      metrics: [
        { label: "Time Spent",        thisWeek: 210, lastWeek: 180, unit: "minutes", max: 300, color: "amber" },
        { label: "Accuracy",          thisWeek: 80,  lastWeek: 74,  unit: "%",       max: 100, color: "brand" },
        { label: "Levels Climbed",    thisWeek: 4,   lastWeek: 3,   unit: "levels",  max: 10,  color: "amber" },
        { label: "Lesson Completion", thisWeek: 65,  lastWeek: 50,  unit: "%",       max: 100, color: "brand" },
      ],
    },
    teachers: [
      {
        id: "mb",
        initials: "BB",
        name: "Mr. Bello",
        role: "Class Teacher",
        subject: "Physics",
        lastMessage: "Victor's practical report was excellent.",
        lastTime: "9:45 AM",
        unread: 1,
      },
      {
        id: "mc",
        initials: "CC",
        name: "Mrs. Chukwu",
        role: "Subject Teacher",
        subject: "Chemistry",
        lastMessage: "Please ensure Victor revises organic chemistry.",
        lastTime: "Yesterday",
        unread: 0,
      },
      {
        id: "ad",
        initials: "AY",
        name: "Mr. Adeyemi",
        role: "Subject Teacher",
        subject: "Further Maths",
        lastMessage: "Victor should attempt the past questions I sent.",
        lastTime: "Tue",
        unread: 3,
      },
    ],
    messages: {
      mb: [
        { id: "1", from: "teacher", senderName: "Mr. Bello",    senderInitials: "BB", text: "Good morning Mr. Okafor. Victor submitted an excellent Physics practical report this week.", time: "9:30 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "That's great news! He spent a lot of time on it over the weekend.", time: "9:38 AM" },
        { id: "3", from: "teacher", senderName: "Mr. Bello",    senderInitials: "BB", text: "It really shows. His analysis of the results was particularly impressive.", time: "9:45 AM" },
      ],
      mc: [
        { id: "1", from: "teacher", senderName: "Mrs. Chukwu",  senderInitials: "CC", text: "Hello. I wanted to flag that Victor needs to revise organic chemistry before the end-of-term exam.", time: "Yesterday 11:00 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "Understood. Are there specific topics he should focus on?", time: "Yesterday 11:20 AM" },
        { id: "3", from: "teacher", senderName: "Mrs. Chukwu",  senderInitials: "CC", text: "Yes — hydrocarbons and functional groups. I'll send a revision sheet by end of day.", time: "Yesterday 11:35 AM" },
        { id: "4", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "Thank you very much, Mrs. Chukwu. We appreciate your support.", time: "Yesterday 12:00 PM" },
      ],
      ad: [
        { id: "1", from: "teacher", senderName: "Mr. Adeyemi",  senderInitials: "AY", text: "Good day Mr. Okafor. I've sent a set of Further Maths past questions to Victor's school portal.", time: "Tue 8:00 AM" },
        { id: "2", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "Thank you, sir. I'll make sure he works through them this week.", time: "Tue 8:30 AM" },
        { id: "3", from: "teacher", senderName: "Mr. Adeyemi",  senderInitials: "AY", text: "Please focus on the integration and differentiation sections — those carry the most marks.", time: "Tue 8:45 AM" },
        { id: "4", from: "teacher", senderName: "Mr. Adeyemi",  senderInitials: "AY", text: "Also, Victor should aim to complete at least two full papers before Friday.", time: "Tue 9:00 AM" },
        { id: "5", from: "parent",  senderName: "Mr. Okafor",   senderInitials: "MO", text: "Noted. We'll get started tonight. Thank you for the guidance.", time: "Tue 9:15 AM" },
      ],
    },
  },
];

/* ─── Section tabs ───────────────────────────────────────── */
const sections: { key: SectionKey; icon: React.ElementType; label: string }[] = [
  { key: "home",         icon: HomeIcon,      label: "Home" },
  { key: "mental-drill", icon: Brain,         label: "Mental Drill" },
  { key: "reading",      icon: BookOpen,      label: "Reading" },
  { key: "progress",     icon: BarChart3,     label: "Progress" },
  { key: "messages",     icon: MessageSquare, label: "Messages" },
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
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
};

/* ─── Greeting ───────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: "Good morning",   emoji: "🌤️" };
  if (h >= 12 && h < 17) return { text: "Good afternoon", emoji: "☀️" };
  if (h >= 17 && h < 21) return { text: "Good evening",   emoji: "🌇" };
  return                         { text: "Good night",     emoji: "🌙" };
}

/* ─── HomeSection ────────────────────────────────────────── */
function HomeSection({ child }: { child: Child }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* Profile card */}
      <motion.div variants={fadeUp} className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full gradient-brand text-xl font-bold text-white">
          {child.initials}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
              {child.name}
            </h2>
            <span className={child.tagColor === "amber" ? "badge-amber" : "badge-brand"}>
              {child.tag}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{child.grade} · {child.level}</p>
          <div className="flex flex-wrap gap-2">
            {child.subjects.map((s) => (
              <span key={s} className="rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-1">
            <Button size="sm" className="gradient-brand border-0 text-white hover:opacity-90">
              {child.learningStatus}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {child.stats.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="surface-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            {stat.highlight ? (
              <div className="mt-3">
                <Button size="sm" className="gradient-brand border-0 text-white hover:opacity-90">
                  {stat.value} {stat.unit}
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-3">
        {child.notifications.map((note, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`surface-card flex items-start gap-3 p-4 ${
              note.color === "success"
                ? "border-l-4 border-l-[oklch(0.68_0.17_145)]"
                : "border-l-4 border-l-[oklch(0.78_0.16_75)]"
            }`}
          >
            {note.color === "success"
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.68_0.17_145)]" />
              : <TrendingDown  className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.78_0.16_75)]" />
            }
            <div>
              <p className="text-sm font-medium text-foreground">{note.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{note.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── ProgressSection ────────────────────────────────────── */
function ProgressSection({ child }: { child: Child }) {
  const { metrics, summary } = child.progress;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="surface-card border-l-4 border-l-[oklch(0.65_0.15_168)] p-5">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Week-over-Week Progress
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Comparing this week&apos;s performance with last week
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
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
              </div>

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

      {/* Summary card */}
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

/* ─── MessagesSection ────────────────────────────────────── */
function MessagesSection({ child }: { child: Child }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    child.teachers[0]?.id ?? ""
  );
  const [showChat, setShowChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTeacher = child.teachers.find((t) => t.id === selectedTeacherId);
  const conversation = selectedTeacherId ? (child.messages[selectedTeacherId] ?? []) : [];

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTeacherId, conversation.length]);

  function handleSelectTeacher(id: string) {
    setSelectedTeacherId(id);
    setShowChat(true);
  }

  function handleSend() {
    // In a real app this would dispatch to state/API; here we just clear the input
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="surface-card overflow-hidden">
      <div className="flex h-[600px]">

        {/* ── Sidebar ── */}
        <div className={`flex w-full flex-col border-r border-border sm:w-72 sm:flex-shrink-0 ${showChat ? "hidden sm:flex" : "flex"}`}>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Teachers</p>
            <p className="text-xs text-muted-foreground">{child.name}&apos;s teachers</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {child.teachers.map((teacher) => {
              const isActive = teacher.id === selectedTeacherId;
              return (
                <button
                  key={teacher.id}
                  onClick={() => handleSelectTeacher(teacher.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                    isActive ? "bg-[oklch(0.65_0.15_168)]/8 border-r-2 border-r-[oklch(0.65_0.15_168)]" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] text-xs font-bold text-white">
                    {teacher.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-sm font-semibold text-foreground">{teacher.name}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{teacher.lastTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <p className="truncate text-xs text-muted-foreground">{teacher.lastMessage}</p>
                      {teacher.unread > 0 && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] text-[10px] font-bold text-white">
                          {teacher.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className={`flex flex-1 flex-col ${showChat ? "flex" : "hidden sm:flex"}`}>
          {selectedTeacher ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <button
                  onClick={() => setShowChat(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted sm:hidden"
                  aria-label="Back to teacher list"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] text-xs font-bold text-white">
                  {selectedTeacher.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedTeacher.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTeacher.subject} · {selectedTeacher.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-3">
                  {conversation.map((msg, idx) => {
                    const isTeacher = msg.from === "teacher";
                    const isFirst = idx === 0 || conversation[idx - 1].from !== msg.from;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isTeacher ? "items-start" : "items-end"}`}>
                        {isFirst && (
                          <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                            {msg.senderName} · {isTeacher ? selectedTeacher.role : "Parent"}
                          </p>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            isTeacher
                              ? "rounded-tl-sm bg-card border border-border text-foreground"
                              : "rounded-tr-sm bg-[oklch(0.65_0.15_168)] text-white"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">{msg.time}</p>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border px-4 py-3">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedTeacher.name}…`}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.65_0.15_168)] text-white transition-opacity disabled:opacity-40 hover:opacity-90"
                    aria-label="Send message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Select a teacher to view messages</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PlaceholderSection ─────────────────────────────────── */
function PlaceholderSection({ label, child }: { label: string; child: Child }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="surface-card flex flex-col items-center justify-center gap-3 py-20 text-center"
    >
      <Flame className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">
        {label} for <span className="text-foreground">{child.name}</span>
      </p>
      <p className="text-xs text-muted-foreground/60">Content coming soon</p>
    </motion.div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
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

      {/* Child tabs */}
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

      {/* Section tabs */}
      <div className="mb-8 flex gap-1.5 overflow-x-auto rounded-2xl bg-muted p-1.5">
        {sections.map(({ key, icon: Icon, label }) => {
          const isActive = activeSection === key;
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`relative flex flex-1 min-w-max items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
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

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeChildId}-${activeSection}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {activeSection === "home"         && <HomeSection        child={child} />}
          {activeSection === "mental-drill" && <PlaceholderSection label="Mental Drill" child={child} />}
          {activeSection === "reading"      && <PlaceholderSection label="Reading"      child={child} />}
          {activeSection === "progress"     && <ProgressSection    child={child} />}
          {activeSection === "messages"     && <MessagesSection    child={child} />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
