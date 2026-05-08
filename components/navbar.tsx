"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Brain,
  BookOpen,
  BarChart3,
  MessageSquare,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { icon: Home,         label: "Home",         href: "/" },
  { icon: Brain,        label: "Mental Drill",  href: "/mental-drill" },
  { icon: BookOpen,     label: "Reading",       href: "/reading" },
  { icon: BarChart3,    label: "Progress",      href: "/progress" },
  { icon: MessageSquare,label: "Messages",      href: "/messages" },
];

export function Navbar() {
  const [active, setActive] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop top navbar ──────────────────────────────── */}
      <header className="sticky top-0 z-50 hidden w-full border-b border-border bg-card/80 backdrop-blur-md md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Creative Learning
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ icon: Icon, label, href }) => {
              const isActive = active === label;
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => { e.preventDefault(); setActive(label); }}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-muted"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right side */}
          <ThemeToggle />
        </div>
      </header>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Creative Learning
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile dropdown menu ────────────────────────────── */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="sticky top-[57px] z-40 w-full border-b border-border bg-card/95 backdrop-blur-md md:hidden"
        >
          <nav className="mx-auto flex max-w-5xl flex-col px-4 py-2">
            {navItems.map(({ icon: Icon, label, href }) => {
              const isActive = active === label;
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => { e.preventDefault(); setActive(label); setMobileOpen(false); }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.15_168)]" />
                  )}
                </a>
              );
            })}
          </nav>
        </motion.div>
      )}

      {/* ── Mobile bottom tab bar ───────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card/95 backdrop-blur-md md:hidden">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = active === label;
          return (
            <a
              key={label}
              href={href}
              onClick={(e) => { e.preventDefault(); setActive(label); setMobileOpen(false); }}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-[oklch(0.65_0.15_168)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label === "Mental Drill" ? "Drill" : label}
              {isActive && (
                <motion.span
                  layoutId="bottom-pill"
                  className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[oklch(0.65_0.15_168)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          );
        })}
      </nav>
    </>
  );
}
