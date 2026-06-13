"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { generateCorpusProjection } from "@/lib/financial-engine";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then(r => r.data);

const timeFilters = ["1Y", "3Y", "5Y", "10Y"] as const;
type TimeFilter = (typeof timeFilters)[number];

const filterMonths: Record<TimeFilter, number> = {
  "1Y": 12,
  "3Y": 36,
  "5Y": 60,
  "10Y": 120,
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="glass-elevated rounded-xl px-4 py-3 shadow-lg border border-brand-primary/20 text-xs">
      <p className="text-text-muted mb-2">Year {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-mono-numbers font-semibold text-text-primary">
            {formatCurrency(entry.value, { compact: true })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CorpusGrowthChart() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("5Y");
  const { data: goals = [], isLoading } = useSWR("/api/goals", fetcher);

  // Derived metrics from real active goals
  const totalMonthlySIP = goals.reduce((sum: number, g: any) => sum + (g.calculations?.requiredSIP ?? g.currentSIP ?? 0), 0);
  const totalCorpus = goals.reduce((sum: number, g: any) => sum + (g.currentCorpus ?? 0), 0);
  
  // Calculate weighted returns based on goals risk appetites
  const totalWeightedReturn = goals.reduce((sum: number, g: any) => {
    const sip = g.calculations?.requiredSIP ?? g.currentSIP ?? 0;
    const riskReturnMap: Record<string, number> = { CONSERVATIVE: 7, BALANCED: 10, AGGRESSIVE: 13 };
    const expectedReturn = riskReturnMap[g.riskAppetite] ?? 10;
    return sum + (expectedReturn * sip);
  }, 0);
  const averageReturn = totalMonthlySIP > 0 ? totalWeightedReturn / totalMonthlySIP : 10.5;

  const data = generateCorpusProjection(
    totalMonthlySIP,
    averageReturn,
    filterMonths[activeFilter],
    totalCorpus,
    6
  );

  // Sample every N points for cleaner chart
  const step = Math.max(1, Math.floor(data.length / 24));
  const chartData = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  const isEmpty = totalCorpus === 0 && totalMonthlySIP === 0;

  return (
    <GlassCard padding="lg" className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="font-jakarta font-semibold text-text-primary text-card-heading">
            Corpus Growth
          </h3>
          <p className="text-sm text-text-muted mt-0.5">
            Projected portfolio value over time
          </p>
        </div>
        <div className="flex gap-1 bg-surface-600/30 rounded-xl p-1">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                activeFilter === filter
                  ? "bg-brand-primary text-white shadow-glow"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="h-[280px] w-full flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      ) : isEmpty ? (
        <div className="h-[280px] w-full flex flex-col items-center justify-center text-center space-y-2 py-8">
          <div className="h-28 w-28 rounded-full border-4 border-dashed border-white/[0.04] flex items-center justify-center text-text-muted">
            Growth View
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">No Projections Available</p>
            <p className="text-[10px] text-text-muted mt-0.5">Add active goals or current investments to forecast portfolio growth.</p>
          </div>
        </div>
      ) : (
        <div
          className="h-[280px]"
          role="img"
          aria-label="Corpus Growth area chart showing projected portfolio growth over time with investment compared to cash holding (eroded value) without investment"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="corpusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="withoutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                stroke="rgba(155,155,192,0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}Y`}
              />
              <YAxis
                stroke="rgba(155,155,192,0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCurrency(v, { compact: true })}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="withoutInvestment"
                name="Without Investment"
                stroke="#FF6B6B"
                strokeWidth={2}
                fill="url(#withoutGradient)"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="corpus"
                name="With WishList"
                stroke="#6C63FF"
                strokeWidth={2.5}
                fill="url(#corpusGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
