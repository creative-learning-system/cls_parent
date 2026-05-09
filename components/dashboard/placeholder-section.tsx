"use client";

import { motion, type Variants } from "framer-motion";
import { Flame } from "lucide-react";
import type { Child } from "@/lib/dashboard-data";

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
};

export function PlaceholderSection({ label, child }: { label: string; child: Child }) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="surface-card flex flex-col items-center justify-center gap-3 py-24 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Flame className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {label} for <span className="text-foreground">{child.name}</span>
      </p>
      <p className="text-xs text-muted-foreground/50">Content coming soon</p>
    </motion.div>
  );
}
