"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { TrendingUp, TrendingDown, Lightbulb, Trophy, Star, RefreshCw } from "lucide-react";
import { getAcademicProfile, type AcademicProfile, type AcademicStrengthArea } from "@/lib/api";
import { fetchCached } from "@/lib/cache";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

function AreaBar({ area, type }: { area: AcademicStrengthArea; type: "strength" | "growth" }) {
  const isStrength = type === "strength";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{area.area}</p>
          <p className="text-[10px] text-muted-foreground">{area.type}</p>
        </div>
        <span className={`text-sm font-bold shrink-0 ${isStrength ? "text-[oklch(0.50_0.14_168)]" : "text-[oklch(0.55_0.12_75)]"}`}>
          {area.score.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${isStrength ? "bg-[oklch(0.65_0.15_168)]" : "bg-[oklch(0.78_0.16_75)]"}`}
          initial={{ width: 0 }}
          animate={{ width: `${area.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{area.details}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="surface-card p-5 flex flex-col gap-4">
          <Skeleton className="h-3.5 w-1/3" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AcademicProfileCard({ studentId, childName }: { studentId: number; childName: string }) {
  const [data, setData]       = useState<AcademicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [retry, setRetry]     = useState(0);
  const firstName = childName.split(" ")[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchCached(`c${studentId}:academic-profile`, () => getAcademicProfile(studentId))
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, retry]);

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="surface-card flex flex-col items-center gap-3 py-12 text-center">
        <Trophy className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Could not load academic profile.</p>
        <button
          onClick={() => setRetry((r) => r + 1)}
          className="flex items-center gap-1.5 text-xs font-medium text-[oklch(0.55_0.14_168)] hover:underline"
        >
          <RefreshCw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
            <p className="text-sm font-semibold text-foreground">Top Strengths</p>
          </div>
          <div className="flex flex-col gap-5">
            {data.strengths.map((s) => <AreaBar key={s.area} area={s} type="strength" />)}
          </div>
        </motion.div>
      )}

      {/* Growth areas */}
      {data.growth_areas.length > 0 && (
        <motion.div variants={fadeUp} className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[oklch(0.78_0.16_75)]" />
            <p className="text-sm font-semibold text-foreground">Growth Areas</p>
          </div>
          <div className="flex flex-col gap-5">
            {data.growth_areas.map((g) => <AreaBar key={g.area} area={g} type="growth" />)}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <motion.div
          variants={fadeUp}
          className="surface-card border border-[oklch(0.65_0.15_168)]/20 bg-[oklch(0.65_0.15_168)]/5 p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[oklch(0.65_0.15_168)]" />
            <p className="text-sm font-semibold text-[oklch(0.50_0.14_168)]">
              Recommendations for {firstName}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.65_0.15_168)]" />
                <p className="text-sm leading-relaxed text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reflection stats */}
      <motion.div variants={fadeUp} className="surface-card flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[oklch(0.78_0.16_75)]" />
          <p className="text-sm font-medium text-foreground">Reading Reflections</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">{data.total_reflections}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-[oklch(0.78_0.16_75)] fill-[oklch(0.78_0.16_75)]" />
            <span className="text-sm font-semibold text-foreground">
              {data.average_reflection_rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">avg</span>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
