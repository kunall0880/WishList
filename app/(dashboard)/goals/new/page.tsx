"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";
import { useGoalStore } from "@/store/useGoalStore";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import type { GoalType, RiskAppetite } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

const goalTypes = [
  { type: "TRAVEL" as GoalType, emoji: "🌍", label: "Europe Trip" },
  { type: "HOUSE" as GoalType, emoji: "🏠", label: "Buy a House" },
  { type: "CAR" as GoalType, emoji: "🚗", label: "Buy a Car" },
  { type: "EDUCATION" as GoalType, emoji: "🎓", label: "Education" },
  { type: "WEDDING" as GoalType, emoji: "💍", label: "Wedding" },
  { type: "EMERGENCY" as GoalType, emoji: "🛡️", label: "Emergency Fund" },
  { type: "RETIREMENT" as GoalType, emoji: "👴", label: "Retirement" },
  { type: "BUSINESS" as GoalType, emoji: "🚀", label: "Business" },
  { type: "TRAVEL" as GoalType, emoji: "✈️", label: "World Tour" },
  { type: "BIKE" as GoalType, emoji: "🏍️", label: "Dream Bike" },
  { type: "GADGET" as GoalType, emoji: "💻", label: "MacBook" },
  { type: "RENOVATION" as GoalType, emoji: "🏗️", label: "Renovation" },
  { type: "OTHER" as GoalType, emoji: "✏️", label: "Custom Goal" },
];

const curatedEmojis = [
  "🎯", "🌍", "🏠", "🚗", "🎓", "💍", "👴", "🚀", "🏍️", "💻", "🏗️", "🛡️", "✈️", "🌴", "🏖️", "🎸",
  "💰", "🐶", "🐱", "🏥", "💊", "🎮", "📷", "🎨", "🍕", "🏋️", "🧳", "🎁", "🌟", "🔑", "🏆", "💎",
  "🚢", "🎭", "📚", "🌿", "🏄", "🛸", "🧸"
];

const riskProfiles = [
  {
    type: "conservative" as RiskAppetite,
    emoji: "🛡️",
    label: "Conservative",
    desc: "FD · Debt Funds",
    returns: "6–8% return",
  },
  {
    type: "balanced" as RiskAppetite,
    emoji: "⚖️",
    label: "Balanced",
    desc: "Hybrid Funds",
    returns: "9–11% return",
  },
  {
    type: "aggressive" as RiskAppetite,
    emoji: "🚀",
    label: "Aggressive",
    desc: "Equity · ETF",
    returns: "12–15% return",
  },
];

const steps = [
  { number: 1, label: "Goal Details" },
  { number: 2, label: "Financial Info" },
  { number: 3, label: "Risk Profile" },
  { number: 4, label: "Review" },
];

interface WizardData {
  goalType: GoalType;
  goalLabel: string;
  goalName: string;
  targetAmount: string;
  targetDate: string;
  priority: number;
  currentSavings: string;
  currentSIP: string;
  lumpSum: string;
  monthlyBudget: string;
  monthlySalary: string;
  salaryGrowth: string;
  inflationRate: number;
  hasEmergencyFund: boolean;
  riskAppetite: RiskAppetite;
  emoji: string;
}

// 5-Question Risk Quiz structure
interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; score: number }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "When do you plan to withdraw this money?",
    options: [
      { label: "Within 2 years (Short-term)", score: 1 },
      { label: "2 to 5 years (Medium-term)", score: 2 },
      { label: "More than 5 years (Long-term)", score: 3 },
    ],
  },
  {
    id: 2,
    question: "If your investment drops by 20% in a month due to market volatility, what would you do?",
    options: [
      { label: "Panic and sell everything immediately to protect capital", score: 1 },
      { label: "Do nothing and wait for recovery", score: 2 },
      { label: "Buy more shares/units at a lower cost to invest more", score: 3 },
    ],
  },
  {
    id: 3,
    question: "How would you describe your experience with financial markets?",
    options: [
      { label: "Beginner — comfortable with FDs, gold, and savings accounts", score: 1 },
      { label: "Intermediate — have invested in mutual funds or large cap stocks", score: 2 },
      { label: "Advanced — regular investor in mid/small caps, direct equity", score: 3 },
    ],
  },
  {
    id: 4,
    question: "What is the most important objective for this specific goal's fund?",
    options: [
      { label: "Capital preservation — safety is my top priority", score: 1 },
      { label: "Balanced growth — beat inflation with moderate volatility", score: 2 },
      { label: "Maximum wealth compounding — high returns are key", score: 3 },
    ],
  },
  {
    id: 5,
    question: "How stable is your primary source of income?",
    options: [
      { label: "Low stability (e.g., freelance, business, commission-based)", score: 1 },
      { label: "Moderately stable (e.g., private sector job, stable business)", score: 2 },
      { label: "Highly stable (e.g., government job, secure corporate role)", score: 3 },
    ],
  },
];

export default function GoalWizardPage() {
  const router = useRouter();
  const addGoal = useGoalStore((s) => s.addGoal);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Live calculation preview state
  const [preview, setPreview] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Risk Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isEmojiPopoverOpen, setIsEmojiPopoverOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Parse pre-selected goal details from query parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const preselectedType = params.get("type") as GoalType | null;
      const preselectedName = params.get("name");

      if (preselectedType) {
        const match = goalTypes.find(g => g.type === preselectedType && (!preselectedName || g.label === preselectedName));
        const finalMatch = match || goalTypes.find(g => g.type === preselectedType) || goalTypes[0];
        
        setData(prev => ({
          ...prev,
          goalType: preselectedType,
          goalLabel: finalMatch.label,
          goalName: preselectedName || (finalMatch.label === "Custom Goal" ? "" : finalMatch.label),
          emoji: finalMatch.emoji
        }));
      } else if (preselectedName) {
        setData(prev => ({
          ...prev,
          goalName: preselectedName
        }));
      }
    }
  }, []);

  const loadingMessages = [
    "Running Monte Carlo simulations (10,000 runs)...",
    "Adjusting for inflation & historic volatility...",
    "Matching asset allocation with top mutual funds...",
    "Generating personalized investment insights...",
  ];

  const [data, setData] = useState<WizardData>({
    goalType: "TRAVEL",
    goalLabel: "Europe Trip",
    goalName: "Europe Trip",
    targetAmount: "4,20,000",
    targetDate: "2027-12",
    priority: 3,
    currentSavings: "40,000",
    currentSIP: "8,250",
    lumpSum: "0",
    monthlyBudget: "",
    monthlySalary: "",
    salaryGrowth: "10",
    inflationRate: 6,
    hasEmergencyFund: false,
    riskAppetite: "balanced",
    emoji: "🎯",
  });

  const update = (key: keyof WizardData, value: string | number | boolean | GoalType | RiskAppetite) => {
    setData((prev) => {
      const updated = { ...prev, [key]: value };
      // If updating goal type and user hasn't typed a custom name, sync name & emoji
      if (key === "goalType") {
        const matchingType = goalTypes.find(g => g.type === value);
        if (matchingType) {
          updated.goalLabel = matchingType.label;
          updated.emoji = matchingType.emoji;
          // Only update name if it matches one of the defaults
          const isDefaultName = goalTypes.some(g => g.label === prev.goalName);
          if (isDefaultName || prev.goalName === "" || prev.goalName === "Custom Goal" || prev.goalName === "Europe Trip") {
            updated.goalName = matchingType.label === "Custom Goal" ? "" : matchingType.label;
          }
        }
      }
      return updated;
    });
  };

  const parseAmount = (s: string | number) => {
    if (typeof s === "number") return s;
    return Number(s.replace(/,/g, "")) || 0;
  };

  const formatInputValue = (val: string) => {
    const num = parseAmount(val);
    if (!num) return val;
    return num.toLocaleString("en-IN");
  };

  // Debounced API calculation preview for Step 2
  useEffect(() => {
    if (currentStep !== 2) return;

    const targetAmount = parseAmount(data.targetAmount);
    if (targetAmount < 1000 || !data.targetDate) return;

    setIsPreviewLoading(true);

    const handler = setTimeout(async () => {
      try {
        const target = new Date(data.targetDate + "-01");
        const msRemaining = target.getTime() - Date.now();
        const timeHorizon = Math.max(0.5, msRemaining / (1000 * 60 * 60 * 24 * 365.25));

        const riskReturnMap: Record<string, number> = {
          conservative: 7,
          balanced: 10,
          aggressive: 13,
        };
        const expectedReturn = riskReturnMap[data.riskAppetite] ?? 10;

        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalAmount: targetAmount,
            monthlySIP: parseAmount(data.currentSIP),
            lumpSum: parseAmount(data.lumpSum),
            expectedReturn,
            inflation: data.inflationRate,
            timeHorizon,
            currentCorpus: parseAmount(data.currentSavings),
            riskAppetite: data.riskAppetite.toUpperCase(),
          }),
        });

        const json = await res.json();
        if (json.success) {
          setPreview(json.data);
        }
      } catch (err) {
        console.error("Preview calculation failed", err);
      } finally {
        setIsPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [
    currentStep,
    data.targetAmount,
    data.currentSIP,
    data.lumpSum,
    data.inflationRate,
    data.currentSavings,
    data.targetDate,
    data.riskAppetite,
  ]);

  // Loading message rotation
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle Quiz selection
  const handleQuizAnswer = (questionId: number, score: number) => {
    const updatedAnswers = { ...quizAnswers, [questionId]: score };
    setQuizAnswers(updatedAnswers);

    // Calculate sum and recommend risk if all are answered
    if (Object.keys(updatedAnswers).length === quizQuestions.length) {
      const totalScore = Object.values(updatedAnswers).reduce((a, b) => a + b, 0);
      let recommended: RiskAppetite = "balanced";
      if (totalScore <= 8) {
        recommended = "conservative";
      } else if (totalScore >= 13) {
        recommended = "aggressive";
      }
      update("riskAppetite", recommended);
      toast.success(`Recommended Risk Profile: ${recommended.toUpperCase()}! 🎯`, {
        icon: "⚖️",
        duration: 4000,
      });
    }
  };

  const getQuizProgressText = () => {
    const answeredCount = Object.keys(quizAnswers).length;
    return `${answeredCount}/${quizQuestions.length} Answered`;
  };

  const canProceed = () => {
    if (currentStep === 1) return data.goalName.length >= 2 && parseAmount(data.targetAmount) >= 1000 && data.targetDate;
    if (currentStep === 2) return true;
    if (currentStep === 3) return !!data.riskAppetite;
    return true;
  };

  const executeFallbackGoalCreation = async () => {
    const fallbackId = `goal-${Date.now()}`;
    const goalData = {
      name: data.goalName,
      type: data.goalType,
      emoji: data.emoji || "🎯",
      targetAmountToday: parseAmount(data.targetAmount),
      targetDate: data.targetDate + "-01",
      inflationRate: data.inflationRate,
      currentCorpus: parseAmount(data.currentSavings),
      currentSIP: parseAmount(data.currentSIP),
      lumpSumAvailable: parseAmount(data.lumpSum),
      riskAppetite: data.riskAppetite.toUpperCase(),
    };

    let aiInsights = null;
    try {
      const aiRes = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalData }),
      });
      const aiResult = await aiRes.json();
      if (aiResult.success) {
        aiInsights = aiResult.data;
      }
    } catch (e) {
      console.error("Fallback AI recommendation failed", e);
    }

    if (!aiInsights) {
      aiInsights = {
        explanation: `Your ${data.goalName} goal of ₹${parseAmount(data.targetAmount).toLocaleString("en-IN")} is achievable with disciplined monthly investing. Based on your ${data.riskAppetite} risk profile, we recommend a diversified portfolio to help you reach your target.`,
        insights: [
          { type: "positive" as const, text: "Goal setup complete — you're ahead of 80% of investors", impact: "high" as const },
          { type: "suggestion" as const, text: "Consider automating your SIP for consistent investing", impact: "medium" as const },
        ],
        instruments: [
          { name: "Balanced Advantage Fund", allocation: 50, expectedReturn: "9–11%", risk: "Moderate" },
          { name: "Short Duration Debt Fund", allocation: 30, expectedReturn: "7–8%", risk: "Low" },
          { name: "Liquid Fund", allocation: 20, expectedReturn: "5–6%", risk: "Very Low" },
        ],
        riskWarning: "Mutual fund investments are subject to market risks. Past performance does not guarantee future returns.",
      };
    }

    const newGoal = {
      id: fallbackId,
      userId: "user-1",
      name: data.goalName,
      type: data.goalType,
      emoji: data.emoji || "🎯",
      targetDate: new Date(data.targetDate + "-01"),
      targetAmountToday: parseAmount(data.targetAmount),
      inflationRate: data.inflationRate,
      currentCorpus: parseAmount(data.currentSavings),
      currentSIP: parseAmount(data.currentSIP),
      lumpSumAvailable: parseAmount(data.lumpSum),
      riskAppetite: data.riskAppetite,
      priority: data.priority,
      status: "ON_TRACK" as const,
      aiInsights,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addGoal(newGoal);
    toast.success("Goal created successfully! 🎯");
    router.push(`/goals/${fallbackId}`);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    const goalPayload = {
      name: data.goalName,
      type: data.goalType,
      emoji: data.emoji || "🎯",
      targetDate: data.targetDate + "-01",
      targetAmountToday: parseAmount(data.targetAmount),
      inflationRate: data.inflationRate,
      currentCorpus: parseAmount(data.currentSavings),
      currentSIP: parseAmount(data.currentSIP),
      lumpSumAvailable: parseAmount(data.lumpSum),
      monthlySalary: parseAmount(data.monthlySalary),
      salaryGrowthRate: parseAmount(data.salaryGrowth),
      monthlyBudget: parseAmount(data.monthlyBudget),
      riskAppetite: data.riskAppetite.toUpperCase(),
      priority: data.priority,
    };

    try {
      const goalRes = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalPayload),
      });

      const goalResult = await goalRes.json();

      if (goalResult.success) {
        const createdGoal = goalResult.data;
        
        // Fetch recommendations
        const aiRes = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalId: createdGoal.id }),
        });
        
        const aiResult = await aiRes.json();
        
        const finalGoal = {
          ...createdGoal,
          targetDate: new Date(createdGoal.targetDate),
          aiInsights: aiResult.success ? aiResult.data : createdGoal.aiInsights,
        };
        addGoal(finalGoal);

        toast.success("Goal created and AI analyzed! 🎯");
        router.push(`/goals/${finalGoal.id}`);
      } else {
        console.warn("API Goal creation failed. Falling back to local store.");
        await executeFallbackGoalCreation();
      }
    } catch (error) {
      console.error("Failed to create goal via API", error);
      await executeFallbackGoalCreation();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pb-20 md:pb-0">
      <h1 className="font-jakarta text-2xl font-bold text-text-primary mb-6">Create New Goal</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
              currentStep > step.number ? "bg-brand-secondary text-white" :
              currentStep === step.number ? "bg-brand-primary text-white" :
              "bg-surface-600/50 text-text-muted"
            )}>
              {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
            </div>
            <span className={cn("text-xs font-medium hidden sm:block", currentStep >= step.number ? "text-text-primary" : "text-text-muted")}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-px mx-2", currentStep > step.number ? "bg-brand-secondary" : "bg-surface-600/50")} />
            )}
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-surface-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-brand-primary/20 border-t-brand-primary animate-spin" />
              <Sparkles className="h-6 w-6 text-brand-secondary absolute animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-jakarta font-semibold text-text-primary text-xl">
                Generating Your Roadmap
              </h3>
              <div className="h-12 flex items-center justify-center">
                <p className="text-sm text-text-secondary animate-pulse px-4">
                  {loadingMessages[loadingMessageIndex]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          {currentStep === 2 ? (
            /* Step 2 Layout with Side-by-Side Live Preview Panel */
            <div className="grid md:grid-cols-5 gap-6 items-start">
              <div className="md:col-span-3">
                <GlassCard padding="lg" className="space-y-5">
                  <h3 className="font-jakarta font-semibold text-text-primary text-base mb-4">Financial Details</h3>
                  {[
                    { key: "currentSavings", label: "Current Savings for this Goal (₹)" },
                    { key: "currentSIP", label: "Monthly SIP You Can Start Now (₹)" },
                    { key: "lumpSum", label: "One-time Lump Sum Addition (₹)" },
                    { key: "monthlyBudget", label: "Total Monthly Savings Budget (₹) (Optional)" },
                    { key: "monthlySalary", label: "Current Monthly In-hand Salary (₹) (Optional)" },
                    { key: "salaryGrowth", label: "Expected Annual Salary Growth (%)" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        value={formatInputValue(data[field.key as keyof WizardData] as string)}
                        onChange={(e) => update(field.key as keyof WizardData, e.target.value)}
                        className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary font-mono-numbers focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-caption uppercase text-text-muted tracking-wider block mb-2">
                      Expected Inflation: <span className="text-brand-primary font-mono-numbers">{data.inflationRate}%</span>
                    </label>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      step={0.5}
                      value={data.inflationRate}
                      onChange={(e) => update("inflationRate", Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #6C63FF ${((data.inflationRate - 3) / 9) * 100}%, rgba(108,99,255,0.15) ${((data.inflationRate - 3) / 9) * 100}%)` }}
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                      data.hasEmergencyFund ? "bg-brand-primary border-brand-primary" : "border-white/[0.2]")}>
                      {data.hasEmergencyFund && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={data.hasEmergencyFund} onChange={(e) => update("hasEmergencyFund", e.target.checked)} />
                    <span className="text-sm text-text-secondary">I have a separate emergency fund (3–6 months expenses)</span>
                  </label>
                </GlassCard>
              </div>

              {/* Sticky Real-time Calculation Preview Panel */}
              <div className="md:col-span-2 md:sticky md:top-24">
                <GlassCard padding="lg" className="border-brand-primary/20 bg-brand-primary/[0.02]">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-brand-primary" />
                    <h3 className="font-jakarta font-semibold text-text-primary text-base">Real-time Forecast</h3>
                  </div>

                  {isPreviewLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
                      <p className="text-xs text-text-muted">Calculating returns...</p>
                    </div>
                  ) : preview ? (
                    <div className="space-y-5">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-text-muted">Target Amount (Inflation Adjusted)</p>
                        <p className="text-xl font-bold text-text-primary font-mono-numbers mt-0.5">
                          {formatCurrency(preview.inflAdjGoal)}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Original: {formatCurrency(parseAmount(data.targetAmount))}
                        </p>
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-text-muted">Required Monthly SIP</p>
                        <p className="text-xl font-bold text-brand-primary font-mono-numbers mt-0.5">
                          {formatCurrency(preview.requiredSIP)}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Based on {data.riskAppetite.toUpperCase()} returns
                        </p>
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      <div>
                        <div className="flex justify-between items-center">
                          <p className="text-[11px] uppercase tracking-wider text-text-muted">SIP Status</p>
                          <span className={cn("text-xs font-bold uppercase px-2 py-0.5 rounded-full",
                            preview.fundingGap === 0 ? "bg-brand-secondary/10 text-brand-secondary" : "bg-brand-gold/10 text-brand-gold")}>
                            {preview.fundingGap === 0 ? "Fully Funded" : "Shortfall"}
                          </span>
                        </div>
                        {preview.fundingGap > 0 ? (
                          <p className="text-sm font-semibold text-brand-gold font-mono-numbers mt-1">
                            Gap of {formatCurrency(preview.fundingGap)}/mo
                          </p>
                        ) : (
                          <p className="text-sm font-semibold text-brand-secondary mt-1">
                            Your monthly SIP is sufficient!
                          </p>
                        )}
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-text-muted mb-2">Success Probability</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-surface-600/50 h-2 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-500",
                              preview.successProbability >= 80 ? "bg-brand-secondary" :
                              preview.successProbability >= 50 ? "bg-brand-gold" : "bg-brand-accent")}
                              style={{ width: `${preview.successProbability}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono-numbers font-bold text-text-primary">
                            {preview.successProbability}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <HelpCircle className="h-8 w-8 text-text-muted mx-auto mb-2" />
                      <p className="text-xs text-text-muted">Enter target details to generate preview projection.</p>
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>
          ) : (
            /* Regular Card Layout for Steps 1, 3, and 4 */
            <GlassCard padding="lg">
              {/* Step 1: Goal Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <label className="text-caption uppercase text-text-muted tracking-wider block mb-3">Goal Type</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {goalTypes.map((gt) => (
                        <button key={gt.label}
                          type="button"
                          onClick={() => {
                            update("goalType", gt.type);
                            setData(prev => ({
                              ...prev,
                              goalLabel: gt.label,
                              goalName: gt.label === "Custom Goal" ? "" : gt.label
                            }));
                          }}
                          className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                            data.goalType === gt.type && data.goalLabel === gt.label ? "border-brand-primary bg-brand-primary/10 scale-[1.04] shadow-glow" : "border-white/[0.06] hover:border-white/[0.12] hover:bg-surface-600/20"
                          )}>
                          <span className="text-2xl">{gt.emoji}</span>
                          <span className="text-xs font-medium text-text-primary">{gt.label}</span>
                          {data.goalType === gt.type && data.goalLabel === gt.label && <Check className="h-3 w-3 text-brand-primary mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {data.goalLabel === "Custom Goal" && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-caption uppercase text-text-muted tracking-wider block">Describe your custom goal</label>
                      <input
                        type="text"
                        maxLength={100}
                        value={data.goalName}
                        onChange={(e) => update("goalName", e.target.value)}
                        className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                        placeholder="e.g. Bali Honeymoon"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Goal Name & Emoji</label>
                    <div className="flex gap-3 items-center">
                      {/* Emoji Selector Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsEmojiPopoverOpen(!isEmojiPopoverOpen)}
                          className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl border border-white/[0.06] bg-surface-600/50 hover:bg-surface-600/80 transition-colors text-text-primary focus-ring select-none"
                        >
                          <span className="text-xl leading-none">{data.emoji || "🎯"}</span>
                          <span className="text-xs text-text-muted">Change</span>
                        </button>
                        
                        {isEmojiPopoverOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsEmojiPopoverOpen(false)} />
                            <div className="absolute left-0 mt-2 p-3 w-[260px] rounded-2xl bg-surface-700 border border-white/[0.08] shadow-2xl z-50 animate-fade-in">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Select Emoji</p>
                              <div className="grid grid-cols-8 gap-1.5">
                                {curatedEmojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      update("emoji", emoji);
                                      setIsEmojiPopoverOpen(false);
                                    }}
                                    className={cn(
                                      "h-7 w-7 flex items-center justify-center rounded-lg hover:bg-surface-600 text-base transition-colors",
                                      data.emoji === emoji && "bg-brand-primary/20 border border-brand-primary/30"
                                    )}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Goal Name Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          maxLength={100}
                          value={data.goalName}
                          onChange={(e) => update("goalName", e.target.value)}
                          className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                          placeholder="Goal Name"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-text-muted">Enter a name up to 100 characters</span>
                      <span className="text-[10px] text-text-muted font-mono-numbers">
                        {data.goalName.length} / 100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Target Amount Today (₹)</label>
                    <input type="text" value={formatInputValue(data.targetAmount)} onChange={(e) => update("targetAmount", e.target.value)}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary font-mono-numbers focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors" />
                  </div>
                  <div>
                    <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Target Date</label>
                    <input type="month" value={data.targetDate} onChange={(e) => update("targetDate", e.target.value)}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors" />
                  </div>
                  <div>
                    <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Goal Priority</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => update("priority", star)}
                          className={cn("text-2xl transition-colors", star <= data.priority ? "text-brand-gold" : "text-text-muted/30")}>
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Risk Profile + Risk Quiz Accordion */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-text-secondary mb-4">Choose the investment approach that matches your comfort level.</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {riskProfiles.map((risk) => (
                        <button key={risk.type} onClick={() => update("riskAppetite", risk.type)}
                          className={cn("flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-all",
                            data.riskAppetite === risk.type
                              ? "border-brand-primary bg-brand-primary/10 scale-[1.03] shadow-glow"
                              : "border-white/[0.06] hover:border-white/[0.12] hover:bg-surface-600/20"
                          )}>
                          <span className="text-3xl">{risk.emoji}</span>
                          <span className="text-base font-semibold text-text-primary">{risk.label}</span>
                          <span className="text-xs text-text-muted">{risk.desc}</span>
                          <span className="text-xs font-mono-numbers text-brand-primary">{risk.returns}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Risk Quiz Accordion */}
                  <div className="border border-white/[0.06] rounded-2xl overflow-hidden mt-6">
                    <button
                      onClick={() => setIsQuizOpen(!isQuizOpen)}
                      className="w-full flex items-center justify-between p-4 bg-surface-600/30 hover:bg-surface-600/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-brand-primary" />
                        <div>
                          <span className="text-sm font-semibold text-text-primary">Unsure? Take the 2-minute Risk Assessment Quiz</span>
                          <p className="text-xs text-text-muted mt-0.5">Determine your ideal profile with 5 quick questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                          {getQuizProgressText()}
                        </span>
                        {isQuizOpen ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isQuizOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-surface-800/20 p-4 border-t border-white/[0.06] divide-y divide-white/[0.04]"
                        >
                          {quizQuestions.map((q) => (
                            <div key={q.id} className="py-4 first:pt-0 last:pb-0">
                              <p className="text-sm font-medium text-text-primary mb-2">
                                {q.id}. {q.question}
                              </p>
                              <div className="grid gap-2 sm:grid-cols-3">
                                {q.options.map((opt) => (
                                  <button
                                    key={opt.label}
                                    onClick={() => handleQuizAnswer(q.id, opt.score)}
                                    className={cn(
                                      "text-left p-3 text-xs rounded-xl border transition-all hover:bg-surface-600/30",
                                      quizAnswers[q.id] === opt.score
                                        ? "border-brand-primary bg-brand-primary/5 text-text-primary font-semibold"
                                        : "border-white/[0.04] bg-surface-800/40 text-text-secondary"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-jakarta font-semibold text-text-primary mb-4">Review Your Goal Plan</h3>
                  {[
                    { label: "Goal", value: `${goalTypes.find(g => g.type === data.goalType)?.emoji || "🎯"} ${data.goalName}` },
                    { label: "Target Amount", value: `₹${formatInputValue(data.targetAmount)}` },
                    { label: "Target Date", value: data.targetDate },
                    { label: "Current Savings Set Aside", value: `₹${formatInputValue(data.currentSavings) || "0"}` },
                    { label: "Proposed Monthly SIP", value: `₹${formatInputValue(data.currentSIP) || "0"}` },
                    { label: "Selected Risk Profile", value: data.riskAppetite.toUpperCase() },
                    { label: "Inflation Rate Assumed", value: `${data.inflationRate}%` },
                    { label: "Priority Level", value: "★".repeat(data.priority) + "☆".repeat(5 - data.priority) },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-sm text-text-muted">{row.label}</span>
                      <span className="text-sm font-medium text-text-primary">{row.value}</span>
                    </div>
                  ))}

                  <div className="p-3 bg-brand-secondary/5 border border-brand-secondary/15 rounded-xl flex gap-2.5 mt-4">
                    <Sparkles className="h-5 w-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Clicking <strong>Analyze Goal</strong> will save this goal and run our machine learning recommendations. We will allocate the optimal mutual funds based on your timeline and risk appetite.
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          className={cn("flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors", currentStep === 1 && "invisible")}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        {currentStep < 4 ? (
          <button onClick={() => setCurrentStep((s) => Math.min(4, s + 1))} disabled={!canProceed()}
            className={cn("gradient-cta text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-1 hover:shadow-glow transition-all",
              !canProceed() && "opacity-40 cursor-not-allowed")}>
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleAnalyze}
            className="gradient-cta text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-glow transition-all">
            <Sparkles className="h-4 w-4" /> Analyze Goal
          </button>
        )}
      </div>
    </motion.div>
  );
}
