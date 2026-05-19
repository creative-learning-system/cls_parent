"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { clearSession } from "@/lib/auth";

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-[var(--shadow-modal)]"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-[oklch(0.95_0.07_25)]">
          <LogOut className="h-5 w-5 text-[oklch(0.50_0.18_25)]" />
        </div>

        <h3
          className="mt-4 text-lg font-semibold text-foreground"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Log out?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You'll need to sign in again to access your dashboard.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border bg-muted/40 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[oklch(0.50_0.18_25)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Log out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  function confirmLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <>
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
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

        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/50 dark:shadow-black/20">
          <ThemeToggle />
          <span className="h-4 w-px bg-border" />
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showLogout && (
          <LogoutModal
            onConfirm={confirmLogout}
            onCancel={() => setShowLogout(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
