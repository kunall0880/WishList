/**
 * Wishlist AI — Goal Timeline Chart
 *
 * Vertical stepper timeline showing milestones from today to goal completion.
 * Calculates milestone dates from projection data.
 */
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Star, Check } from "lucide-react";

interface Milestone {
  label: string;
  date: Date;
  corpus: number;
  percentage: number;
  isCompleted: boolean;
  isActive: boolean;
  isFinal: boolean;
}

interface GoalTimelineProps {
  goalName: string;
  startDate: Date;
  targetDate: Date;
  currentCorpus: number;
  targetAmount: number;
  projectionData: Array<{ year: number; corpus: number; invested: number }>;
}

export function GoalTimelineChart({
  goalName,
  startDate,
  targetDate,
  currentCorpus,
  targetAmount,
  projectionData,
}: GoalTimelineProps) {
  // Calculate milestones
  const milestones: Milestone[] = [];
  const now = new Date();
  const currentPct = targetAmount > 0 ? (currentCorpus / targetAmount) * 100 : 0;

  // Today
  milestones.push({
    label: "Goal Created",
    date: startDate,
    corpus: currentCorpus,
    percentage: currentPct,
    isCompleted: true,
    isActive: false,
    isFinal: false,
  });

  // Start investing
  const sipStartDate = new Date(now);
  sipStartDate.setMonth(sipStartDate.getMonth() + 1);
  milestones.push({
    label: "Start SIP",
    date: sipStartDate,
    corpus: currentCorpus,
    percentage: currentPct,
    isCompleted: now >= sipStartDate,
    isActive: now < sipStartDate && now >= startDate,
    isFinal: false,
  });

  // 25%, 50%, 75% milestones from projection data
  const pctMilestones = [25, 50, 75];
  for (const pct of pctMilestones) {
    const targetCorpus = targetAmount * (pct / 100);
    const entry = projectionData.find((d) => d.corpus >= targetCorpus);
    if (entry) {
      const milestoneDate = new Date(startDate);
      milestoneDate.setMonth(milestoneDate.getMonth() + entry.year * 12);
      milestones.push({
        label: `${pct}% Milestone`,
        date: milestoneDate,
        corpus: Math.round(targetCorpus),
        percentage: pct,
        isCompleted: currentCorpus >= targetCorpus,
        isActive: false,
        isFinal: false,
      });
    }
  }

  // Goal achieved
  milestones.push({
    label: `${goalName} Achieved! 🎉`,
    date: targetDate,
    corpus: targetAmount,
    percentage: 100,
    isCompleted: currentCorpus >= targetAmount,
    isActive: false,
    isFinal: true,
  });

  return (
    <div className="relative">
      {milestones.map((milestone, i) => (
        <motion.div
          key={milestone.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="flex gap-4 pb-8 last:pb-0"
        >
          {/* Vertical line + node */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors z-10",
                milestone.isFinal && milestone.isCompleted
                  ? "bg-brand-gold border-brand-gold"
                  : milestone.isCompleted
                    ? "bg-brand-primary border-brand-primary"
                    : milestone.isActive
                      ? "border-brand-primary bg-transparent animate-pulse-ring"
                      : "border-surface-600 bg-surface-800"
              )}
            >
              {milestone.isFinal ? (
                <Star className="h-4 w-4 text-white" />
              ) : milestone.isCompleted ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    milestone.isActive ? "bg-brand-primary" : "bg-surface-600"
                  )}
                />
              )}
            </div>
            {i < milestones.length - 1 && (
              <div
                className={cn(
                  "w-px flex-1 min-h-[24px]",
                  milestone.isCompleted
                    ? "bg-brand-primary"
                    : "bg-surface-600 border-l border-dashed border-surface-600"
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 -mt-1">
            <p
              className={cn(
                "text-sm font-semibold",
                milestone.isCompleted || milestone.isActive
                  ? "text-text-primary"
                  : "text-text-muted"
              )}
            >
              {milestone.label}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text-muted">
                {milestone.date.toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {milestone.corpus > 0 && (
                <>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs font-mono-numbers text-text-secondary">
                    {formatCurrency(milestone.corpus, { compact: true })}
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
