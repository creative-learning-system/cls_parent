"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const router = useRouter();

  function handleLogout() {
    router.push("/login");
  }

  return (
    <header className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">

      {/* Logo pill */}
      <Link
        href="/"
        className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl transition-opacity hover:opacity-80 dark:border-white/10 dark:bg-black/50 dark:shadow-black/20"
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

      {/* Right pill — theme toggle + logout */}
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/50 dark:shadow-black/20">
        <ThemeToggle />
        <span className="h-4 w-px bg-border" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="Log out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>

    </header>
  );
}
