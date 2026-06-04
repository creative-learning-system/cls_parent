"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthTopBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
      <Link
        href="/"
        className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl transition-opacity hover:opacity-80 dark:border-white/10 dark:bg-black/50"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand shadow-sm overflow-hidden">
          <img src="/favicon.ico" alt="Creative Learning" className="h-5 w-5 object-contain" />
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
      <div className="pointer-events-auto rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/50">
        <ThemeToggle />
      </div>
    </div>
  );
}
