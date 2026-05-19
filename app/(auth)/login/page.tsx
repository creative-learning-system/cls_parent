"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { login, isAuthenticated } from "@/lib/auth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.require_password_change) {
        router.push("/change-password");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
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
          <h1
            className="text-3xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your parent dashboard
          </p>
        </motion.div>

        {/* Card */}
        <motion.div variants={fadeUp} className="surface-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
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
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[oklch(0.65_0.15_168)]/60 focus:bg-card"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[oklch(0.65_0.15_168)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-[oklch(0.65_0.15_168)]/60 focus:bg-card"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
