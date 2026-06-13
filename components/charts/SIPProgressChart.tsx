/**
 * Wishlist AI — SIP Progress Chart
 *
 * Recharts ComposedChart combining:
 * - Bars for "Total SIP Invested" (violet) and "Returns Earned" (mint, stacked)
 * - Line for "Goal Target" (dashed, coral)
 */
"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import { formatCurrency } from "@/lib/utils";

interface SIPProgressChartProps {
  projectionData: Array<{
    year: number;
    corpus: number;
    invested: number;
  }>;
  targetAmount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="glass-elevated rounded-xl px-4 py-3 shadow-lg border border-brand-primary/20">
      <p className="text-xs text-text-muted mb-2">Year {label}</p>
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

export function SIPProgressChart({
  projectionData,
  targetAmount,
}: SIPProgressChartProps) {
  // Calculate returns earned for each year
  const chartData = projectionData
    .filter((_, i) => {
      const step = Math.max(1, Math.floor(projectionData.length / 20));
      return i % step === 0 || i === projectionData.length - 1;
    })
    .map((d) => ({
      year: d.year,
      invested: Math.round(d.invested),
      returns: Math.round(Math.max(0, d.corpus - d.invested)),
      target: Math.round(targetAmount),
    }));

  return (
    <GlassCard padding="lg">
      <h3 className="font-jakarta font-semibold text-text-primary mb-4">
        SIP Progress
      </h3>
      <div
        className="h-[280px]"
        role="img"
        aria-label="SIP Progress chart showing growth stacked bars of Invested vs Returns and a dashed horizontal target line for the goal"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
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
              tickFormatter={(v) =>
                formatCurrency(v, { compact: true })
              }
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              formatter={(value: string) => (
                <span className="text-text-secondary text-xs">{value}</span>
              )}
            />
            <Bar
              dataKey="invested"
              name="Invested"
              stackId="total"
              fill="#6C63FF"
              radius={[0, 0, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="returns"
              name="Returns"
              stackId="total"
              fill="#06D6A0"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Goal Target"
              stroke="#FF6B6B"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
