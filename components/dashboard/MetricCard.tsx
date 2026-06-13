"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  chartData?: number[];
  decimals?: number;
}

export function MetricCard({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  icon: Icon,
  trend = "neutral",
  chartData,
  decimals = 0,
}: MetricCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-brand-secondary"
      : trend === "down"
        ? "text-brand-accent"
        : "text-text-muted";

  return (
    <GlassCard hover padding="md" className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
            <Icon className="h-4 w-4 text-brand-primary" />
          </div>
          <span className="text-sm text-text-secondary font-medium">
            {title}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-text-primary font-mono-numbers">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          </div>

          {/* Change indicator */}
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-1", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span className="text-xs font-medium font-mono-numbers">
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-xs text-text-muted">vs last month</span>
            </div>
          )}
        </div>

        {/* Mini sparkline */}
        {chartData && chartData.length > 0 && (
          <div className="flex items-end gap-0.5 h-8 opacity-50">
            {chartData.map((val, i) => {
              const max = Math.max(...chartData);
              const height = max > 0 ? (val / max) * 100 : 0;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="w-1 rounded-full bg-brand-primary/40"
                />
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
