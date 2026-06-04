"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, X, Bell, MessageSquare, Smartphone, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { clearSession } from "@/lib/auth";
import { getNotifications, type Notification as ApiNotification } from "@/lib/api";

/* ─── Logout modal ───────────────────────────────────────── */
function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-[var(--shadow-modal)]"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
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

        <h3 className="mt-4 text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
          Log out?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll need to sign in again to access your dashboard.
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

/* ─── Notification item ──────────────────────────────────── */
function NotifItem({ notif }: { notif: ApiNotification }) {
  const isWhatsApp = notif.type === "WhatsApp";
  const date = new Date(notif.sent_at);
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40 ${!notif.read ? "bg-[oklch(0.65_0.15_168)]/4" : ""}`}>
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
        isWhatsApp
          ? "bg-[oklch(0.93_0.06_145)]/60"
          : "bg-[oklch(0.65_0.15_168)]/10"
      }`}>
        {isWhatsApp
          ? <Smartphone className="h-3.5 w-3.5 text-[oklch(0.45_0.14_145)]" />
          : <MessageSquare className="h-3.5 w-3.5 text-[oklch(0.55_0.14_168)]" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-foreground">{notif.message}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{dateStr} · {timeStr}</p>
      </div>
      {!notif.read && (
        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.65_0.15_168)]" />
      )}
    </div>
  );
}

/* ─── Notifications panel ────────────────────────────────── */
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs]   = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotifications()
      .then((d) => setNotifs(Array.isArray(d?.notifications) ? d.notifications : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <motion.div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-[var(--shadow-modal)] overflow-hidden"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{ opacity: 0, y: -8,   scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unread > 0 && (
            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[oklch(0.65_0.15_168)] border-t-transparent" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Inbox className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          notifs.map((n) => <NotifItem key={n.id} notif={n} />)
        )}
      </div>
    </motion.div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
export function Navbar() {
  const router = useRouter();
  const [showLogout, setShowLogout]           = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount]         = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotifications()
      .then((d) => setUnreadCount((Array.isArray(d?.notifications) ? d.notifications : []).filter((n) => !n.read).length))
      .catch(() => {});
  }, []);

  function confirmLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <>
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl transition-opacity hover:opacity-80 dark:border-white/10 dark:bg-black/50 dark:shadow-black/20"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand shadow-sm overflow-hidden">
            <img src="/favicon.ico" alt="Creative Learning" className="h-5 w-5 object-contain" />
          </div>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[13px] font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Creative Learning
            </span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
              Parent Dashboard
            </span>
          </div>
        </Link>

        {/* Right actions */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/20 bg-white/50 px-4 py-2.5 shadow-md shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-black/50 dark:shadow-black/20">
          <ThemeToggle />

          <span className="h-4 w-px bg-border" />

          {/* Notifications bell */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] px-0.5 text-[8px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
              )}
            </AnimatePresence>
          </div>

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
          <LogoutModal onConfirm={confirmLogout} onCancel={() => setShowLogout(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
