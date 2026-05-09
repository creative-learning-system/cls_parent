"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    // After progress bar finishes, fade out then redirect to login
    const hideTimer = setTimeout(() => setVisible(false), 1800);
    const navTimer  = setTimeout(() => router.push("/login"), 2350);
    return () => { clearTimeout(hideTimer); clearTimeout(navTimer); };
  }, [router]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand shadow-lg overflow-hidden"
          >
            <img src="/favicon.ico" alt="Creative Learning" className="h-11 w-11 object-contain" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Creative Learning
            </span>
            <span className="text-sm text-muted-foreground">
              Loading your dashboard…
            </span>
          </motion.div>

          <div className="h-0.5 w-40 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full gradient-brand"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
