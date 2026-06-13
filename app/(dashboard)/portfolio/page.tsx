"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { useGoalStore } from "@/store/useGoalStore";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  BarChart3,
  Briefcase,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#6C63FF", "#06D6A0", "#FFD166", "#FF6B6B"];

export default function PortfolioPage() {
  const goals = useGoalStore((s) => s.goals);

  // 1. Aggregates from real goals
  const totalPortfolioValue = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.currentCorpus, 0);
  }, [goals]);

  const totalMonthlySIP = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.currentSIP, 0);
  }, [goals]);

  const averageXIRR = useMemo(() => {
    if (goals.length === 0) return 0;
    // Weighted return based on risk profile return estimates
    let weightedReturnSum = 0;
    let totalSIP = 0;
    goals.forEach((g) => {
      const riskReturnMap: Record<string, number> = {
        conservative: 7,
        balanced: 10,
        aggressive: 13.5,
      };
      const ret = riskReturnMap[g.riskAppetite.toLowerCase()] ?? 10;
      weightedReturnSum += ret * (g.currentSIP || 5000);
      totalSIP += (g.currentSIP || 5000);
    });
    return totalSIP > 0 ? Math.round((weightedReturnSum / totalSIP) * 10) / 10 : 10.5;
  }, [goals]);

  // 2. Recommended vs Current Allocation Aggregates
  const allocationComparison = useMemo(() => {
    // Current allocation: conservative (FD/Debt), balanced (Hybrid), aggressive (Equity)
    let equitySum = 0;
    let debtSum = 0;
    let goldSum = 0;
    let cashSum = 0;

    goals.forEach((g) => {
      const corpus = g.currentCorpus;
      if (g.riskAppetite === "conservative") {
        debtSum += corpus * 0.7;
        cashSum += corpus * 0.3;
      } else if (g.riskAppetite === "balanced") {
        equitySum += corpus * 0.5;
        debtSum += corpus * 0.3;
        goldSum += corpus * 0.1;
        cashSum += corpus * 0.1;
      } else {
        // Aggressive
        equitySum += corpus * 0.85;
        debtSum += corpus * 0.1;
        goldSum += corpus * 0.05;
      }
    });

    const totalCalculated = equitySum + debtSum + goldSum + cashSum;

    // Fallbacks if total is 0
    const currentData = totalCalculated > 0 ? [
      { name: "Equity", value: Math.round(equitySum) },
      { name: "Debt", value: Math.round(debtSum) },
      { name: "Gold", value: Math.round(goldSum) },
      { name: "Cash", value: Math.round(cashSum) },
    ] : [
      { name: "Equity", value: 450000 },
      { name: "Debt", value: 300000 },
      { name: "Gold", value: 80000 },
      { name: "Cash", value: 50000 },
    ];

    // Recommended allocation (sum of fund lists inside AI recommendations)
    let recEquity = 0;
    let recDebt = 0;
    let recCash = 0;

    goals.forEach((g) => {
      const corpus = g.currentCorpus || 10000;
      if (g.aiInsights?.instruments) {
        g.aiInsights.instruments.forEach((inst: any) => {
          const alloc = inst.allocation / 100;
          if (inst.risk === "High" || inst.risk === "Very High") {
            recEquity += corpus * alloc;
          } else if (inst.risk === "Moderate") {
            recEquity += corpus * alloc * 0.5;
            recDebt += corpus * alloc * 0.5;
          } else {
            recDebt += corpus * alloc;
          }
        });
      } else {
        // Fallback recommendations
        recEquity += corpus * 0.6;
        recDebt += corpus * 0.4;
      }
    });

    const recTotal = recEquity + recDebt + recCash;
    const recommendedData = recTotal > 0 ? [
      { name: "Equity", value: Math.round(recEquity) },
      { name: "Debt", value: Math.round(recDebt) },
      { name: "Gold/Cash", value: Math.round(recCash) },
    ] : [
      { name: "Equity", value: 550000 },
      { name: "Debt", value: 280000 },
      { name: "Gold/Cash", value: 50000 },
    ];

    return { currentData, recommendedData };
  }, [goals]);

  // 3. Goals by Timeline Horizontal Bar Chart
  const timelineData = useMemo(() => {
    let shortCount = 0;
    let shortSIP = 0;
    let medCount = 0;
    let medSIP = 0;
    let longCount = 0;
    let longSIP = 0;

    goals.forEach((g) => {
      const years = Math.max(0.5, (new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25));
      if (years < 3) {
        shortCount++;
        shortSIP += g.currentSIP;
      } else if (years < 7) {
        medCount++;
        medSIP += g.currentSIP;
      } else {
        longCount++;
        longSIP += g.currentSIP;
      }
    });

    return [
      { name: "Short Term (<3 yrs)", goalsCount: shortCount, monthlySIP: shortSIP },
      { name: "Medium Term (3-7 yrs)", goalsCount: medCount, monthlySIP: medSIP },
      { name: "Long Term (7+ yrs)", goalsCount: longCount, monthlySIP: longSIP },
    ];
  }, [goals]);

  // 4. Risk Distribution
  const riskDistribution = useMemo(() => {
    let conservativeVal = 0;
    let balancedVal = 0;
    let aggressiveVal = 0;

    goals.forEach((g) => {
      const risk = g.riskAppetite.toLowerCase();
      if (risk === "conservative") conservativeVal += g.currentCorpus;
      else if (risk === "balanced") balancedVal += g.currentCorpus;
      else if (risk === "aggressive") aggressiveVal += g.currentCorpus;
    });

    return [
      { name: "Conservative", value: conservativeVal || 1 },
      { name: "Balanced", value: balancedVal || 1 },
      { name: "Aggressive", value: aggressiveVal || 1 },
    ];
  }, [goals]);

  // 5. Goal Priority Matrix
  const priorityMatrix = useMemo(() => {
    const matrix = {
      highOnTrack: [] as string[],
      highAtRisk: [] as string[],
      lowOnTrack: [] as string[],
      lowAtRisk: [] as string[],
    };

    goals.forEach((g) => {
      const isHighPriority = g.priority >= 4;
      const isOnTrack = g.status === "ON_TRACK" || g.status === "COMPLETED";

      if (isHighPriority && isOnTrack) {
        matrix.highOnTrack.push(g.name);
      } else if (isHighPriority && !isOnTrack) {
        matrix.highAtRisk.push(g.name);
      } else if (!isHighPriority && isOnTrack) {
        matrix.lowOnTrack.push(g.name);
      } else {
        matrix.lowAtRisk.push(g.name);
      }
    });

    return matrix;
  }, [goals]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-text-primary">Portfolio Analytics</h1>
        <p className="text-sm text-text-muted mt-1">Weighted allocation, timelines, and goal correlation analysis</p>
      </div>

      {/* Summary Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard elevated padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-brand-primary animate-pulse" />
            <span className="text-sm text-text-muted">Net Invested Corpus</span>
          </div>
          <div className="text-3xl font-bold text-text-primary font-mono-numbers">
            <AnimatedCounter value={totalPortfolioValue} prefix="₹" />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Aggregated across <strong>{goals.length} active</strong> goals
          </p>
        </GlassCard>

        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-brand-secondary" />
            <span className="text-sm text-text-muted">Monthly SIP Allocation</span>
          </div>
          <div className="text-2xl font-bold text-brand-secondary font-mono-numbers">
            {formatCurrency(totalMonthlySIP)}
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Systematic wealth addition
          </p>
        </GlassCard>

        <GlassCard padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-brand-gold" />
            <span className="text-sm text-text-muted">Weighted Return CAGR</span>
          </div>
          <div className="text-2xl font-bold text-brand-gold font-mono-numbers">
            {averageXIRR}%
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Weighted by monthly SIP amount
          </p>
        </GlassCard>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Recommended vs Current Asset Allocation */}
        <GlassCard padding="lg">
          <h3 className="font-jakarta font-semibold text-text-primary text-base mb-2">Recommended vs Current Asset Allocation</h3>
          <p className="text-xs text-text-muted mb-4">Compares your current asset layout with recommended targets</p>
          <div className="h-[250px] flex items-center justify-around">
            <div className="text-center w-1/2">
              <span className="text-xs text-text-secondary font-bold block mb-2">Current Asset Allocation</span>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={allocationComparison.currentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationComparison.currentData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v, { compact: true })} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {allocationComparison.currentData.map((d, index) => (
                  <span key={d.name} className="text-[10px] text-text-secondary flex items-center gap-1 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-px bg-white/[0.06] h-full mx-2" />

            <div className="text-center w-1/2">
              <span className="text-xs text-brand-primary font-bold block mb-2">AI Recommended Targets</span>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={allocationComparison.recommendedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationComparison.recommendedData.map((_, index) => (
                      <Cell key={index} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v, { compact: true })} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                {allocationComparison.recommendedData.map((d, index) => (
                  <span key={d.name} className="text-[10px] text-text-secondary flex items-center gap-1 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[(index + 1) % COLORS.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Goals by Timeline Horizontal Bar Chart */}
        <GlassCard padding="lg">
          <h3 className="font-jakarta font-semibold text-text-primary text-base mb-2">Timeline and SIP Allocation</h3>
          <p className="text-xs text-text-muted mb-4 font-medium">SIP budget distribution based on goal deadlines</p>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" stroke="rgba(155,155,192,0.4)" fontSize={9} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <YAxis dataKey="name" type="category" stroke="rgba(155,155,192,0.4)" fontSize={9} width={90} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="monthlySIP" name="Monthly SIP Allocation" fill="#6C63FF" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Risk Distribution Pie */}
        <GlassCard padding="lg">
          <h3 className="font-jakarta font-semibold text-text-primary text-base mb-2">Corpus Risk Profile Distribution</h3>
          <p className="text-xs text-text-muted mb-4">Corpus accumulation weighted by risk appetite profiles</p>
          <div className="h-[250px] flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="h-[200px] w-[200px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#06D6A0" /> {/* Conservative */}
                    <Cell fill="#FFD166" /> {/* Balanced */}
                    <Cell fill="#FF6B6B" /> {/* Aggressive */}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v, { compact: true })} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: "Conservative", color: "bg-brand-secondary", val: riskDistribution[0].value, desc: "Liquid & Debt funds" },
                { label: "Balanced", color: "bg-brand-gold", val: riskDistribution[1].value, desc: "Hybrid & Balanced advantage" },
                { label: "Aggressive", color: "bg-brand-accent", val: riskDistribution[2].value, desc: "Large/mid/small cap equity" },
              ].map((rk) => (
                <div key={rk.label} className="flex items-start gap-2.5">
                  <span className={cn("h-3 w-3 rounded-md mt-0.5", rk.color)} />
                  <div>
                    <span className="text-xs font-bold text-text-primary">{rk.label}</span>
                    <p className="text-[10px] text-text-muted">{rk.desc} • {formatCurrency(rk.val)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Goal Priority Matrix */}
        <GlassCard padding="lg">
          <h3 className="font-jakarta font-semibold text-text-primary text-base mb-2">Goal Correlation Matrix</h3>
          <p className="text-xs text-text-muted mb-4">Correlates goal urgency (Priority) with funding wellness (Status)</p>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            
            {/* High Priority / On Track */}
            <div className="p-4 rounded-2xl bg-brand-secondary/5 border border-brand-secondary/10 space-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-brand-secondary" />
                <span className="text-xs font-bold text-text-primary">Urgent & On Track</span>
              </div>
              <ul className="space-y-1">
                {priorityMatrix.highOnTrack.length > 0 ? (
                  priorityMatrix.highOnTrack.map((name) => (
                    <li key={name} className="text-[10px] text-text-secondary font-medium">• {name}</li>
                  ))
                ) : (
                  <li className="text-[10px] text-text-muted italic">None</li>
                )}
              </ul>
            </div>

            {/* High Priority / At Risk */}
            <div className="p-4 rounded-2xl bg-brand-accent/5 border border-brand-accent/10 space-y-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-brand-accent" />
                <span className="text-xs font-bold text-text-primary">Urgent & Underfunded</span>
              </div>
              <ul className="space-y-1">
                {priorityMatrix.highAtRisk.length > 0 ? (
                  priorityMatrix.highAtRisk.map((name) => (
                    <li key={name} className="text-[10px] text-brand-accent font-semibold">• {name}</li>
                  ))
                ) : (
                  <li className="text-[10px] text-text-muted italic">None</li>
                )}
              </ul>
            </div>

            {/* Low Priority / On Track */}
            <div className="p-4 rounded-2xl bg-surface-600/20 border border-white/[0.04] space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-text-muted" />
                <span className="text-xs font-bold text-text-primary">Flexible & On Track</span>
              </div>
              <ul className="space-y-1">
                {priorityMatrix.lowOnTrack.length > 0 ? (
                  priorityMatrix.lowOnTrack.map((name) => (
                    <li key={name} className="text-[10px] text-text-secondary">• {name}</li>
                  ))
                ) : (
                  <li className="text-[10px] text-text-muted italic">None</li>
                )}
              </ul>
            </div>

            {/* Low Priority / At Risk */}
            <div className="p-4 rounded-2xl bg-surface-600/10 border border-white/[0.02] space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-text-muted/30" />
                <span className="text-xs font-bold text-text-primary">Flexible & Underfunded</span>
              </div>
              <ul className="space-y-1">
                {priorityMatrix.lowAtRisk.length > 0 ? (
                  priorityMatrix.lowAtRisk.map((name) => (
                    <li key={name} className="text-[10px] text-text-muted">• {name}</li>
                  ))
                ) : (
                  <li className="text-[10px] text-text-muted italic">None</li>
                )}
              </ul>
            </div>

          </div>
        </GlassCard>

      </div>
    </motion.div>
  );
}
