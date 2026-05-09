"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

function PasswordInput({
  id, label, value, onChange, placeholder, autoComplete,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          minLength={8}
          className="w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[oklch(0.65_0.15_168)]/60 focus:bg-card"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

/* Password strength indicator */
function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-[oklch(0.60_0.22_25)]", "bg-[oklch(0.78_0.16_75)]", "bg-[oklch(0.68_0.17_145)]", "bg-[oklch(0.65_0.15_168)]"];

  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-medium text-foreground">{labels[score]}</span>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        {/* Back */}
        <motion.div variants={fadeUp} className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1
            className="text-3xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Create new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="surface-card p-8">
          {!done ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <PasswordInput
                id="password"
                label="New password"
                value={password}
                onChange={setPassword}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />

              <StrengthBar password={password} />

              <PasswordInput
                id="confirm"
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-[oklch(0.95_0.07_25)] px-4 py-2.5 text-xs font-medium text-[oklch(0.50_0.18_25)]"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {loading ? "Saving…" : "Set new password"}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center gap-4 py-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.93_0.06_145)]">
                <CheckCircle2 className="h-7 w-7 text-[oklch(0.50_0.14_145)]" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Password updated!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Redirecting you to sign in…
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
