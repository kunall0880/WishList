"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/types";
import Link from "next/link";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const statusColors: Record<string, string> = {
  ON_TRACK: "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20",
  AT_RISK: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
  OFF_TRACK: "bg-brand-accent/10 text-brand-accent border-brand-accent/20",
  COMPLETED: "bg-text-muted/10 text-text-muted border-text-muted/20",
};

const statusLabels: Record<string, string> = {
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  OFF_TRACK: "Off Track",
  COMPLETED: "Completed",
};

const goalEmojis: Record<string, string> = {
  TRAVEL: "🌍",
  HOUSE: "🏠",
  CAR: "🚗",
  EDUCATION: "🎓",
  WEDDING: "💍",
  EMERGENCY: "🛡️",
  RETIREMENT: "👴",
  BUSINESS: "🚀",
  BIKE: "🏍️",
  GADGET: "💻",
  RENOVATION: "🏗️",
  OTHER: "🎯",
};

interface GoalCardProps {
  goal: Goal;
  index?: number;
}

export function GoalCard({ goal, index = 0 }: GoalCardProps) {
  const progress = Math.min(
    100,
    Math.round((goal.currentCorpus / goal.targetAmountToday) * 100)
  );

  const monthsLeft = Math.max(
    0,
    Math.round(
      (new Date(goal.targetDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24 * 30)
    )
  );

  const progressColor =
    goal.status === "ON_TRACK"
      ? "#06D6A0"
      : goal.status === "AT_RISK"
        ? "#FFD166"
        : "#FF6B6B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.06,
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      <Link href={`/goals/${goal.id}`}>
        <GlassCard
          hover
          glow
          padding="md"
          className="cursor-pointer group transition-all duration-300 hover:border-brand-primary/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {goalEmojis[goal.type] || "🎯"}
              </div>
              <div>
                <h3 className="font-jakarta font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
                  {goal.name}
                </h3>
                <p className="text-xs text-text-muted">
                  {monthsLeft > 0
                    ? `${Math.floor(monthsLeft / 12)}y ${monthsLeft % 12}m remaining`
                    : "Past due"}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                statusColors[goal.status]
              )}
            >
              {statusLabels[goal.status]}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-text-muted uppercase tracking-wide">
                Target
              </p>
              <p className="text-lg font-bold text-text-primary font-mono-numbers">
                {formatCurrency(goal.targetAmountToday, { compact: true })}
              </p>
              <p className="text-xs text-text-muted">
                SIP:{" "}
                <span className="text-text-secondary font-mono-numbers">
                  {formatCurrency(goal.currentSIP)}
                </span>
                /mo
              </p>
            </div>
            <div className="h-16 w-16">
              <CircularProgressbar
                value={progress}
                text={`${progress}%`}
                styles={buildStyles({
                  textSize: "24px",
                  pathColor: progressColor,
                  textColor: "rgb(var(--color-text-primary))",
                  trailColor: "rgba(108, 99, 255, 0.08)",
                  pathTransitionDuration: 1,
                })}
              />
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
