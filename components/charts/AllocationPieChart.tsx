"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import { formatCurrency } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then(r => r.data);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; amount: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="glass-elevated rounded-xl px-4 py-3 shadow-lg border border-brand-primary/20 text-xs">
      <p className="font-semibold text-text-primary">{data.name}</p>
      <p className="text-text-muted mt-0.5 font-mono-numbers">
        {data.value}% · {formatCurrency(data.amount)}/mo
      </p>
    </div>
  );
}

export function AllocationPieChart() {
  const { data: goals = [], isLoading } = useSWR("/api/goals", fetcher);

  // Default mock breakdown if loading
  let allocationData = [
    { name: "Equity", value: 55, amount: 0, color: "#6C63FF" },
    { name: "Debt", value: 30, amount: 0, color: "#06D6A0" },
    { name: "Gold", value: 10, amount: 0, color: "#FFD166" },
    { name: "Cash", value: 5, amount: 0, color: "#5C5C8A" },
  ];

  let totalMonthly = 0;

  if (goals && goals.length > 0) {
    let totalEquity = 0;
    let totalDebt = 0;
    let totalGold = 0;
    let totalCash = 0;

    goals.forEach((g: any) => {
      const sip = g.calculations?.requiredSIP ?? g.currentSIP ?? 0;
      const risk = g.riskAppetite;

      if (risk === "CONSERVATIVE") {
        totalEquity += sip * 0.10;
        totalDebt += sip * 0.70;
        totalCash += sip * 0.20;
      } else if (risk === "AGGRESSIVE") {
        totalEquity += sip * 0.80;
        totalDebt += sip * 0.15;
        totalCash += sip * 0.05;
      } else {
        // BALANCED
        totalEquity += sip * 0.55;
        totalDebt += sip * 0.30;
        totalGold += sip * 0.10;
        totalCash += sip * 0.05;
      }
    });

    totalMonthly = totalEquity + totalDebt + totalGold + totalCash;

    if (totalMonthly > 0) {
      allocationData = [
        { name: "Equity", value: Math.round((totalEquity / totalMonthly) * 100), amount: Math.round(totalEquity), color: "#6C63FF" },
        { name: "Debt", value: Math.round((totalDebt / totalMonthly) * 100), amount: Math.round(totalDebt), color: "#06D6A0" },
        { name: "Gold", value: Math.round((totalGold / totalMonthly) * 100), amount: Math.round(totalGold), color: "#FFD166" },
        { name: "Cash", value: Math.round((totalCash / totalMonthly) * 100), amount: Math.round(totalCash), color: "#5C5C8A" },
      ].filter(item => item.amount > 0); // Only keep categories with active allocations
    }
  }

  const isEmpty = totalMonthly === 0;

  return (
    <GlassCard padding="lg" className="h-full">
      <h3 className="font-jakarta font-semibold text-text-primary text-card-heading mb-6">
        Investment Allocation
      </h3>

      {isLoading ? (
        <div className="h-[180px] w-full flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] w-full flex flex-col items-center justify-center text-center space-y-2 py-4">
          <div className="h-24 w-24 rounded-full border-4 border-dashed border-white/[0.04] flex items-center justify-center text-text-muted">
            N/A
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">No Active Allocations</p>
            <p className="text-[10px] text-text-muted mt-0.5">Define your goals and SIP targets to view asset split.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Pie chart */}
          <div
            className="relative h-[180px] w-[180px] flex-shrink-0"
            role="img"
            aria-label={`Investment allocation pie chart. Total monthly SIP: ${formatCurrency(totalMonthly)}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="amount"
                  strokeWidth={0}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <p className="text-sm sm:text-base font-bold text-text-primary font-mono-numbers truncate max-w-[120px]">
                {formatCurrency(totalMonthly)}
              </p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider">
                / month
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 flex-1 w-full">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-xs sm:text-sm text-text-secondary">{item.name}</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-text-primary font-mono-numbers">
                    {item.value}%
                  </span>
                  <span className="text-[11px] text-text-muted font-mono-numbers">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
