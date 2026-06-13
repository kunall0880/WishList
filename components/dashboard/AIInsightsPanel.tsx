"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface Insight {
  type: "warning" | "suggestion" | "positive";
  title: string;
  subtitle: string;
  actionLabel?: string;
}

const insights: Insight[] = [
  {
    type: "warning",
    title: "Increase SIP by ₹2,500/mo",
    subtitle: "Europe Trip · High impact",
    actionLabel: "Apply",
  },
  {
    type: "positive",
    title: "Add ₹50,000 lump sum",
    subtitle: "Reduces monthly burden by 18%",
  },
  {
    type: "suggestion",
    title: "Switch Europe Trip to Flexi Cap",
    subtitle: "Potential 2% better RoI",
    actionLabel: "Review",
  },
  {
    type: "positive",
    title: "Emergency fund is 60% funded",
    subtitle: "On track to complete by March 2026",
  },
  {
    type: "warning",
    title: "Car goal SIP is ₹3,000 short",
    subtitle: "Increase to ₹15,000 or extend timeline",
    actionLabel: "Fix",
  },
];

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    color: "text-brand-gold",
    bg: "bg-brand-gold/10",
    border: "border-brand-gold/20",
  },
  positive: {
    icon: CheckCircle2,
    color: "text-brand-secondary",
    bg: "bg-brand-secondary/10",
    border: "border-brand-secondary/20",
  },
  suggestion: {
    icon: Sparkles,
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
    border: "border-brand-primary/20",
  },
};

export function AIInsightsPanel() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <GlassCard padding="lg" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-primary" />
          <h3 className="font-jakarta font-semibold text-text-primary text-card-heading">
            AI Insights
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-primary transition-colors"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      {/* Insights list */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {insights.map((insight, i) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={cn(
                "flex items-start gap-3 rounded-xl p-3 border transition-colors hover:bg-surface-600/20",
                config.border,
                "border"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 mt-0.5",
                  config.bg
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {insight.title}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {insight.subtitle}
                </p>
              </div>
              {insight.actionLabel && (
                <button className="flex items-center gap-0.5 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors flex-shrink-0">
                  {insight.actionLabel}
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
