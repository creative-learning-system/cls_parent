"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">

      {/* Logo pill */}
      <Link
        href="/"
        className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl transition-opacity hover:opacity-80 dark:border-white/10 dark:bg-black/50 dark:shadow-black/20"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex flex-col leading-none gap-0.5">
          <span
            className="text-[13px] font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Creative Learning
          </span>
          <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
            Parent Dashboard
          </span>
        </div>
      </Link>

      {/* Theme toggle pill */}
      <div className="pointer-events-auto rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/50 dark:shadow-black/20">
        <ThemeToggle />
      </div>

    </header>
  );
}
