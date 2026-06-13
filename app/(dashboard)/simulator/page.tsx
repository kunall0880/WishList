"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { cn, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  TrendingUp,
  PiggyBank,
  Coins,
  Scale,
  Sparkles,
  HelpCircle,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface SliderConfig {
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

const sliders: SliderConfig[] = [
  {
    label: "Goal Amount today",
    key: "goalAmount",
    min: 50000,
    max: 10000000,
    step: 50000,
    format: (v) => formatCurrency(v, { compact: true }),
  },
  {
    label: "Monthly SIP outlay",
    key: "monthlySIP",
    min: 0,
    max: 100000,
    step: 500,
    format: (v) => formatCurrency(v),
  },
  {
    label: "Initial Lump Sum",
    key: "lumpSum",
    min: 0,
    max: 5000000,
    step: 10000,
    format: (v) => formatCurrency(v, { compact: true }),
  },
  {
    label: "Expected Return (CAGR)",
    key: "expectedReturn",
    min: 4,
    max: 20,
    step: 0.5,
    format: (v) => `${v}%`,
  },
  {
    label: "Inflation Rate",
    key: "inflation",
    min: 3,
    max: 12,
    step: 0.5,
    format: (v) => `${v}%`,
  },
  {
    label: "Time Horizon",
    key: "timeHorizon",
    min: 1,
    max: 40,
    step: 1,
    format: (v) => `${v} yr${v > 1 ? "s" : ""}`,
  },
];

const presets = [
  { name: "Europe Vacation", goalAmount: 420000, monthlySIP: 8000, lumpSum: 40000, expectedReturn: 8.5, inflation: 6, timeHorizon: 3 },
  { name: "Premium EV SUV", goalAmount: 1800000, monthlySIP: 25000, lumpSum: 150000, expectedReturn: 11, inflation: 6, timeHorizon: 5 },
  { name: "House Down Payment", goalAmount: 3500000, monthlySIP: 35000, lumpSum: 500000, expectedReturn: 12, inflation: 6, timeHorizon: 7 },
  { name: "Child Education Fund", goalAmount: 5000000, monthlySIP: 15000, lumpSum: 200000, expectedReturn: 13, inflation: 7, timeHorizon: 12 },
  { name: "Retirement Goal", goalAmount: 30000000, monthlySIP: 20000, lumpSum: 1000000, expectedReturn: 14, inflation: 6, timeHorizon: 25 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;
  return (
    <div className="glass-elevated rounded-xl px-4 py-3 shadow-lg border border-brand-primary/20">
      <p className="text-[10px] text-text-muted mb-2 font-semibold">Year {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-mono-numbers font-semibold text-text-primary">
            {formatCurrency(entry.value, { compact: true })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SimulatorPage() {
  const [values, setValues] = useState({
    goalAmount: 1500000,
    monthlySIP: 18000,
    lumpSum: 100000,
    expectedReturn: 11,
    inflation: 6,
    timeHorizon: 6,
  });

  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Call calculate API whenever values change (debounced)
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalAmount: values.goalAmount,
            monthlySIP: values.monthlySIP,
            lumpSum: values.lumpSum,
            expectedReturn: values.expectedReturn,
            inflation: values.inflation,
            timeHorizon: values.timeHorizon,
            currentCorpus: 0,
          }),
        });
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (e) {
        console.error("Simulation engine failed", e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [
    values.goalAmount,
    values.monthlySIP,
    values.lumpSum,
    values.expectedReturn,
    values.inflation,
    values.timeHorizon,
  ]);

  const handleChange = useCallback((key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Compute achieve year for chart reference line
  const achieveYear = data && data.achieveMonths > 0 ? Number((data.achieveMonths / 12).toFixed(1)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-text-primary">Investment Simulator</h1>
          <p className="text-sm text-text-muted mt-0.5">Simulate compounding, inflation impact, and risk profiles</p>
        </div>
        <div className="flex items-center bg-surface-600/30 rounded-2xl p-1 self-start sm:self-auto border border-white/[0.04]">
          <button
            onClick={() => setCompareMode(false)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
              !compareMode ? "bg-brand-primary text-white shadow-glow" : "text-text-muted hover:text-text-primary"
            )}
          >
            Single Simulation
          </button>
          <button
            onClick={() => setCompareMode(true)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
              compareMode ? "bg-brand-primary text-white shadow-glow" : "text-text-muted hover:text-text-primary"
            )}
          >
            <Scale className="h-3.5 w-3.5" /> Compare Profiles
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => setValues(preset)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium border border-white/[0.08] text-text-secondary hover:border-brand-primary/30 hover:text-brand-primary hover:bg-brand-primary/5 transition-all bg-surface-800/40"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Col: Sliders (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <GlassCard padding="lg">
            <h3 className="font-jakarta font-semibold text-text-primary text-base mb-5">Parameters</h3>
            <div className="space-y-6">
              {sliders.map((slider) => {
                const val = values[slider.key as keyof typeof values];
                const pct = ((val - slider.min) / (slider.max - slider.min)) * 100;
                return (
                  <div key={slider.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{slider.label}</label>
                      <span className="text-sm font-bold text-brand-primary font-mono-numbers">
                        {slider.format(val)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={val}
                      onChange={(e) => handleChange(slider.key, Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #6C63FF ${pct}%, rgba(108,99,255,0.15) ${pct}%)`,
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-text-muted">{slider.format(slider.min)}</span>
                      <span className="text-[10px] text-text-muted">{slider.format(slider.max)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Col: Outputs (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {loading && !data ? (
            <GlassCard padding="lg" className="h-[400px] flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
              <p className="text-xs text-text-muted">Calculating forecast...</p>
            </GlassCard>
          ) : data ? (
            <AnimatePresence mode="wait">
              {!compareMode ? (
                /* Single Simulation Mode Views */
                <motion.div
                  key="single"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Headline Output */}
                  <GlassCard elevated padding="lg" className="border-brand-primary/10">
                    <div className="text-center relative">
                      {loading && <Loader2 className="h-4 w-4 text-brand-primary animate-spin absolute top-0 right-0" />}
                      <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Accumulated Corpus</p>
                      <div className="text-4xl sm:text-5xl font-extrabold text-brand-primary font-mono-numbers tracking-tight">
                        <AnimatedCounter value={data.totalFV} prefix="₹" />
                      </div>
                      <p className="text-text-secondary mt-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
                        {data.achievable ? (
                          <span className="text-brand-secondary flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Goal achievable in {achieveYear} years!
                          </span>
                        ) : (
                          <span className="text-brand-accent flex items-center gap-1 bg-brand-accent/5 px-3 py-1 rounded-full border border-brand-accent/10">
                            <AlertTriangle className="h-4 w-4 animate-bounce" /> Cost Shortfall of {formatCurrency(data.inflAdjGoal - data.totalFV)}
                          </span>
                        )}
                      </p>
                    </div>
                  </GlassCard>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Total Invested", value: data.totalInvested, icon: PiggyBank, color: "text-brand-primary" },
                      { label: "CAGR Return", value: `${values.expectedReturn}%`, isString: true, icon: TrendingUp, color: "text-brand-secondary" },
                      { label: "Wealth Multiple", value: `${data.wealthMultiple}x`, isString: true, icon: Coins, color: "text-brand-gold" },
                      { label: "Inflation Cost", value: data.inflAdjGoal, icon: Sparkles, color: "text-brand-accent" },
                    ].map((st, idx) => (
                      <GlassCard key={idx} padding="md">
                        <div className="flex items-center gap-1.5 mb-2">
                          <st.icon className={cn("h-4 w-4", st.color)} />
                          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{st.label}</span>
                        </div>
                        <p className="text-base font-bold text-text-primary font-mono-numbers">
                          {st.isString ? st.value : formatCurrency(st.value, { compact: true })}
                        </p>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Chart */}
                  <GlassCard padding="lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-jakarta font-semibold text-text-primary text-base">Growth Over Time</h3>
                        <p className="text-xs text-text-muted mt-0.5">Friction comparison: Invested vs Wealth generated</p>
                      </div>
                      {achieveYear && (
                        <span className="text-[10px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-bold px-2 py-0.5 rounded-full">
                          Goal achieved at Year {achieveYear}
                        </span>
                      )}
                    </div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                          <defs>
                            <linearGradient id="simCorpusGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="simInvestedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="year" stroke="rgba(155,155,192,0.4)" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}Y`} />
                          <YAxis stroke="rgba(155,155,192,0.4)" fontSize={10} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                          <Tooltip content={<CustomTooltip />} />
                          {achieveYear && (
                            <ReferenceLine
                              x={achieveYear}
                              stroke="#FFD166"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              label={{ value: "Goal Achieved", position: "top", fill: "#FFD166", fontSize: 9, fontWeight: "bold" }}
                            />
                          )}
                          <Area type="monotone" dataKey="invested" name="Invested Principal" stroke="#06D6A0" strokeWidth={1.5} fill="url(#simInvestedGrad)" strokeDasharray="4 4" />
                          <Area type="monotone" dataKey="corpus" name="Total Wealth" stroke="#6C63FF" strokeWidth={2} fill="url(#simCorpusGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                /* Compare Risk Profiles Mode View */
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="font-jakarta font-semibold text-text-primary text-base">Risk Profile Scenario Comparison</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {data.scenarios.map((sc: any, idx: number) => {
                      const returnRate = sc.returnRate;
                      const shortfall = data.inflAdjGoal - sc.totalFV;
                      const isAch = sc.achievable;
                      const expectedSIPValue = sc.totalFV > 0 ? Math.round(values.monthlySIP * (data.inflAdjGoal / sc.totalFV)) : 0;

                      return (
                        <GlassCard
                          key={idx}
                          padding="md"
                          className={cn(
                            "flex flex-col justify-between border transition-all hover:scale-[1.01]",
                            isAch ? "border-brand-secondary/20 bg-brand-secondary/[0.01]" : "border-brand-accent/20 bg-brand-accent/[0.01]"
                          )}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-text-primary">{sc.label}</span>
                              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                                isAch ? "bg-brand-secondary/10 text-brand-secondary" : "bg-brand-accent/10 text-brand-accent"
                              )}>
                                {isAch ? "Achievable" : "Shortfall"}
                              </span>
                            </div>

                            <div>
                              <p className="text-[10px] text-text-muted uppercase">Projected corpus</p>
                              <p className="text-lg font-bold text-text-primary font-mono-numbers mt-0.5">{formatCurrency(sc.totalFV)}</p>
                            </div>

                            {shortfall > 0 ? (
                              <p className="text-[10px] text-brand-accent font-medium leading-snug">
                                Shortfall of {formatCurrency(shortfall)}
                              </p>
                            ) : (
                              <p className="text-[10px] text-brand-secondary font-medium leading-snug">
                                Surplus of {formatCurrency(-shortfall)}
                              </p>
                            )}

                            <div className="h-px bg-white/[0.05] pt-1" />

                            <div className="space-y-1 text-[10px] text-text-secondary">
                              <p className="flex justify-between">
                                <span>Ideal Return CAGR:</span>
                                <span className="font-bold text-text-primary font-mono-numbers">{returnRate}%</span>
                              </p>
                              <p className="flex justify-between">
                                <span>Adjusted Needed SIP:</span>
                                <span className="font-bold text-brand-primary font-mono-numbers">{formatCurrency(expectedSIPValue)}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              handleChange("expectedReturn", returnRate);
                              setCompareMode(false);
                              toast.success(`Active CAGR set to ${returnRate}%!`);
                            }}
                            className="w-full text-center py-1.5 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg text-[10px] font-bold transition-all mt-4 border border-brand-primary/10"
                          >
                            Use Return Profile
                          </button>
                        </GlassCard>
                      );
                    })}
                  </div>

                  {/* Inflation Comparison Alert */}
                  <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/15 text-xs text-text-secondary leading-relaxed">
                    <p>
                      💡 <strong>Asset Allocation Insight:</strong> Conservative profiles focus on debt/liquid mutual funds (e.g. 7-8% returns) and carry lower volatility, whereas Aggressive profiles consist heavily of equity mutual funds (e.g. 13-15% returns) which help beat high inflation but display higher market fluctuations.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="py-20 text-center text-xs text-text-muted">
              Enter target details on the left to start simulations.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
