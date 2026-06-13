/**
 * Wishlist AI — Shimmer Loading Skeletons
 *
 * Animated skeleton placeholders for loading states.
 * Uses CSS shimmer animation defined in globals.css.
 */
"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "metric" | "chart" | "table-row" | "circle" | "avatar";
  count?: number;
}

function SkeletonBase({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 bg-[length:200%_100%]",
        className
      )}
      style={style}
    />
  );
}

export function Skeleton({ className, variant = "text", count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  switch (variant) {
    case "text":
      return (
        <div className={cn("space-y-2", className)}>
          {items.map((i) => (
            <SkeletonBase key={i} className="h-4 w-full" />
          ))}
        </div>
      );

    case "card":
      return (
        <div className={cn("glass-card rounded-3xl p-6 space-y-4", className)}>
          <div className="flex items-center gap-3">
            <SkeletonBase className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBase className="h-4 w-3/4" />
              <SkeletonBase className="h-3 w-1/2" />
            </div>
          </div>
          <SkeletonBase className="h-20 w-full" />
          <div className="flex gap-2">
            <SkeletonBase className="h-8 w-20 rounded-lg" />
            <SkeletonBase className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      );

    case "metric":
      return (
        <div className={cn("glass-card rounded-3xl p-5 space-y-3", className)}>
          <div className="flex items-center gap-2">
            <SkeletonBase className="h-8 w-8 rounded-lg" />
            <SkeletonBase className="h-3 w-24" />
          </div>
          <SkeletonBase className="h-8 w-32" />
          <SkeletonBase className="h-3 w-20" />
        </div>
      );

    case "chart":
      return (
        <div className={cn("glass-card rounded-3xl p-6 space-y-4", className)}>
          <SkeletonBase className="h-5 w-40" />
          <div className="flex items-end gap-1 h-[200px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonBase
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${30 + Math.random() * 60}%` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      );

    case "table-row":
      return (
        <div className={cn("space-y-0", className)}>
          {items.map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04]"
            >
              <SkeletonBase className="h-4 w-4 rounded" />
              <SkeletonBase className="h-4 w-32" />
              <SkeletonBase className="h-4 w-20 ml-auto" />
              <SkeletonBase className="h-4 w-16" />
              <SkeletonBase className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      );

    case "circle":
      return <SkeletonBase className={cn("h-16 w-16 rounded-full", className)} />;

    case "avatar":
      return <SkeletonBase className={cn("h-10 w-10 rounded-full", className)} />;

    default:
      return <SkeletonBase className={className} />;
  }
}

/**
 * Full-page skeleton for dashboard loading
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="metric" />
        ))}
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <Skeleton variant="chart" className="lg:col-span-3" />
        <Skeleton variant="card" className="lg:col-span-2" />
      </div>
    </div>
  );
}

/**
 * Goal detail page skeleton
 */
export function GoalDetailSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SkeletonBase className="h-48 w-full rounded-3xl" />
      <div className="grid sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="metric" />
        ))}
      </div>
      <Skeleton variant="card" />
      <Skeleton variant="chart" />
    </div>
  );
}
