"use client";

import { motion } from "framer-motion";
import { MessageSquare, Clock } from "lucide-react";
import type { Child } from "@/lib/dashboard-data";

export function MessagesSection({ child }: { child: Child }) {
  const firstName = child.name.split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="surface-card flex flex-col items-center gap-5 py-16 text-center px-8">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[oklch(0.65_0.15_168)]/10">
          <MessageSquare className="h-7 w-7 text-[oklch(0.55_0.14_168)]" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.78_0.16_75)]">
            <Clock className="h-2.5 w-2.5 text-white" />
          </span>
        </div>

        <div>
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Messaging Coming Soon
          </h3>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Direct messaging between parents and {firstName}&apos;s teachers is on its way. You&apos;ll be able to send and receive messages right here.
          </p>
        </div>

        <div className="w-full max-w-xs rounded-xl border border-[oklch(0.65_0.15_168)]/20 bg-[oklch(0.65_0.15_168)]/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            For urgent matters, please contact the school directly or reach out via the school&apos;s existing communication channels.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
