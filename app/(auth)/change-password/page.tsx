"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { changePassword, isAuthenticated } from "@/lib/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs transition-colors ${met ? "text-[oklch(0.55_0.14_168)]" : "text-muted-foreground"}`}>
      <span className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${met ? "bg-[oklch(0.65_0.15_168)] text-white" : "bg-muted text-muted-foreground"}`}>
        {met ? "✓" : "·"}
      </span>
      {text}
    </span>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  const rules = {
    length:    newPw.length >= 8,
    uppercase: /[A-Z]/.test(newPw),
    lowercase: /[a-z]/.test(newPw),
    number:    /[0-9]/.test(newPw),
    different: newPw.length > 0 && newPw !== currentPw,
  };
  const allRulesMet = Object.values(rules).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allRulesMet) {
      setError("Please satisfy all password requirements.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPw, newPw);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        {/* Heading */}
        <motion.div variants={fadeUp} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand shadow-md">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1
            className="text-3xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your temporary password must be changed before continuing.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div variants={fadeUp} className="surface-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Current password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="current-pw">
                Current password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="current-pw"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[oklch(0.65_0.15_168)]/60 focus:bg-card"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCurrent ? "Hide" : "Show"}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="new-pw">
                New password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="new-pw"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[oklch(0.65_0.15_168)]/60 focus:bg-card"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNew ? "Hide" : "Show"}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Rules */}
              {newPw.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-1 grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted/40 p-3"
                >
                  <PasswordRule met={rules.length}    text="8+ characters" />
                  <PasswordRule met={rules.uppercase}  text="Uppercase letter" />
                  <PasswordRule met={rules.lowercase}  text="Lowercase letter" />
                  <PasswordRule met={rules.number}     text="Number" />
                  <PasswordRule met={rules.different}  text="Different from current" />
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="confirm-pw">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirm-pw"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full rounded-xl border bg-muted/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:bg-card ${
                    confirmPw.length > 0 && confirmPw !== newPw
                      ? "border-[oklch(0.65_0.18_25)]"
                      : "border-border focus:border-[oklch(0.65_0.15_168)]/60"
                  }`}
                />
              </div>
              {confirmPw.length > 0 && confirmPw !== newPw && (
                <p className="text-xs text-[oklch(0.50_0.18_25)]">Passwords do not match</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-[oklch(0.95_0.07_25)] px-4 py-2.5 text-xs font-medium text-[oklch(0.50_0.18_25)]"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {loading ? "Changing password…" : "Change password"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
