"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        {/* Back link */}
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
            Forgot password?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="surface-card p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@creativeleaning.com"
                    required
                    className="w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[oklch(0.65_0.15_168)]/60 focus:bg-card"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {loading ? "Sending…" : "Send reset link"}
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
                  Check your inbox
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We sent a reset link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  It expires in 30 minutes.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-2 text-sm font-medium text-[oklch(0.65_0.15_168)] hover:underline"
              >
                Back to sign in
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
