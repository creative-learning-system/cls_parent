"use client";

import { motion, type Variants } from "framer-motion";
import { Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const stats = [
  { label: "Today's Activity", value: "35",  unit: "minutes" },
  { label: "This Week",        value: "180", unit: "minutes total" },
  { label: "Learning Status",  value: "Consistent", unit: "learning", highlight: true },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">

      {/* Welcome */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-8">
        <motion.p variants={fadeUp} className="mb-1 text-sm font-medium text-brand">
          Good morning 👋
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="text-3xl font-semibold text-foreground"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Welcome, Mr. Okafor
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1 text-sm text-muted-foreground">
          Here's how your children are doing today.
        </motion.p>
      </motion.div>

      {/* Child selector */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {[
          { initials: "CO", name: "Chidera Okafor", status: "Consistent Learning", active: true },
          { initials: "VO", name: "Victor Okafor",  status: "Consistent Learning", active: false },
        ].map((child) => (
          <motion.div
            key={child.name}
            variants={scaleIn}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={`surface-card flex cursor-pointer items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-card-hover)] ${
              child.active ? "ring-2 ring-[oklch(0.65_0.15_168)]" : ""
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white">
              {child.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{child.name}</p>
              <span className="badge-brand mt-1">{child.status}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="surface-card p-5"
          >
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
                <span
                  className="text-4xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.unit}</span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Notification banners */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {[
          {
            color: "success",
            title: "Chidera has been promoted in Order of Operation",
            sub: "Category: Logical Reasoning — Great work, keep encouraging Chidera",
          },
          {
            color: "amber",
            title: "Chidera has been demoted in Sentence Analysis",
            sub: "Category: Linguistic Reasoning — Chidera may need your attention here.",
          },
        ].map((note, idx) => (
          <motion.div
            key={idx}
            variants={fadeUp}
            className={`surface-card flex items-start gap-3 p-4 ${
              note.color === "success"
                ? "border-l-4 border-l-[oklch(0.68_0.17_145)]"
                : "border-l-4 border-l-[oklch(0.78_0.16_75)]"
            }`}
          >
            <div
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                note.color === "success"
                  ? "bg-[oklch(0.68_0.17_145)]"
                  : "bg-[oklch(0.78_0.16_75)]"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{note.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{note.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
