"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGoalStore } from "@/store/useGoalStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { formatCurrency, formatNumber, formatPercent, cn } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash2,
  Share2,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Clock,
  X,
  Target,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";

import dynamic from "next/dynamic";
import { useTypewriter } from "@/hooks/useTypewriter";
import { ConfettiRain } from "@/components/shared/ConfettiRain";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

const GoalTimelineChart = dynamic(
  () => import("@/components/charts/GoalTimelineChart").then((mod) => mod.GoalTimelineChart),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-surface-800" /> }
);
const RiskGaugeChart = dynamic(
  () => import("@/components/charts/RiskGaugeChart").then((mod) => mod.RiskGaugeChart),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-2xl bg-surface-800" /> }
);
const SIPProgressChart = dynamic(
  () => import("@/components/charts/SIPProgressChart").then((mod) => mod.SIPProgressChart),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-surface-800" /> }
);
import { GoalDetailSkeleton } from "@/components/shared/Skeleton";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { inflationAdjustedFV, requiredSIP, requiredLumpSum } from "@/lib/financial-engine";

// Recharts for inflation impact and growth projection tabs
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const goalGradients: Record<string, string> = {
  TRAVEL: "from-[#6C63FF] to-[#3B82F6]",
  HOUSE: "from-[#4338CA] to-[#06B6D4]",
  CAR: "from-[#6C63FF] to-[#8B5CF6]",
  EDUCATION: "from-[#06D6A0] to-[#3B82F6]",
  WEDDING: "from-[#EC4899] to-[#8B5CF6]",
  EMERGENCY: "from-[#06D6A0] to-[#10B981]",
  RETIREMENT: "from-[#F59E0B] to-[#EF4444]",
  BUSINESS: "from-[#6C63FF] to-[#EC4899]",
  BIKE: "from-[#EF4444] to-[#F97316]",
  GADGET: "from-[#6C63FF] to-[#06D6A0]",
  RENOVATION: "from-[#F59E0B] to-[#6C63FF]",
  OTHER: "from-[#6C63FF] to-[#9B8FFF]",
};

const goalEmojis: Record<string, string> = {
  TRAVEL: "🌍", HOUSE: "🏠", CAR: "🚗", EDUCATION: "🎓", WEDDING: "💍",
  EMERGENCY: "🛡️", RETIREMENT: "👴", BUSINESS: "🚀", BIKE: "🏍️",
  GADGET: "💻", RENOVATION: "🏗️", OTHER: "🎯",
};

const insightTypeConfig = {
  warning: { icon: AlertTriangle, color: "text-brand-gold", bg: "bg-brand-gold/10" },
  positive: { icon: CheckCircle2, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
  suggestion: { icon: Sparkles, color: "text-brand-primary", bg: "bg-brand-primary/10" },
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;

  // Local Zustand fallback hooks
  const localGoal = useGoalStore((s) => s.getGoalById(goalId));
  const updateLocalGoal = useGoalStore((s) => s.updateGoal);
  const deleteLocalGoal = useGoalStore((s) => s.deleteGoal);

  // States
  const [activeTab, setActiveTab] = useState<"growth" | "sip" | "inflation" | "breakdown">("growth");
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeScenario, setActiveScenario] = useState<{
    label: string;
    impact: string;
    action: string;
    desc: string;
    value: number;
  } | null>(null);
  const [isAutoSipModalOpen, setIsAutoSipModalOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editCurrentCorpus, setEditCurrentCorpus] = useState("");
  const [editCurrentSIP, setEditCurrentSIP] = useState("");
  const [editRiskAppetite, setEditRiskAppetite] = useState<"conservative" | "balanced" | "aggressive">("balanced");
  const [editPriority, setEditPriority] = useState(3);
  const [editStatus, setEditStatus] = useState<"ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETED">("ON_TRACK");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // SWR for API fetching
  const { data: apiData, error, isLoading: isSwrLoading, mutate } = useSWR(
    goalId ? `/api/goals/${goalId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Resolve DB status vs Mock fallback
  const isDbAvailable = apiData && apiData.success;
  const goal = isDbAvailable ? apiData.data : localGoal;

  // Initialize edit fields
  useEffect(() => {
    if (goal) {
      setEditName(goal.name);
      setEditTargetAmount(goal.targetAmountToday.toString());
      // Convert Date object/string to yyyy-MM
      const date = new Date(goal.targetDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      setEditTargetDate(`${year}-${month}`);
      setEditCurrentCorpus(goal.currentCorpus.toString());
      setEditCurrentSIP(goal.currentSIP.toString());
      setEditRiskAppetite(goal.riskAppetite.toLowerCase() as any);
      setEditPriority(goal.priority);
      setEditStatus(goal.status);
    }
  }, [goal]);

  // Typewriter effect on AI insights explanation (called unconditionally before early returns)
  const explanationText = goal?.aiInsights?.explanation || "";
  const { displayedText: typedExplanation, isComplete: typewriterComplete } = useTypewriter(explanationText, { speed: 8 });

  // Keyboard access — close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditModalOpen(false);
        setIsAutoSipModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isSwrLoading) {
    return <GoalDetailSkeleton />;
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="font-jakarta text-2xl font-bold text-text-primary mb-2">Goal not found</h2>
        <Link href="/goals" className="text-brand-primary hover:underline">← Back to Goals</Link>
      </div>
    );
  }

  // Pre-calculate variables
  const calculations = goal.calculations || {
    futureValue: goal.targetAmountToday,
    requiredSIP: 1000,
    fundingGap: 0,
    successProbability: 75,
    riskScore: 50,
    yearsRemaining: 5,
    expectedReturn: 10,
    projectionData: [],
  };

  // Dynamic What-If Calculations
  let previewCalculations = { ...calculations };
  if (activeScenario) {
    if (activeScenario.action === "delay") {
      previewCalculations.yearsRemaining += 0.5;
      const newMonths = Math.max(1, Math.round(previewCalculations.yearsRemaining * 12));
      previewCalculations.requiredSIP = Math.round(requiredSIP(
        previewCalculations.futureValue,
        previewCalculations.expectedReturn,
        newMonths,
        goal.currentCorpus
      ));
      previewCalculations.fundingGap = Math.max(0, previewCalculations.futureValue - (goal.currentCorpus + previewCalculations.requiredSIP * newMonths));
    } else if (activeScenario.action === "lumpsum") {
      const newCorpus = goal.currentCorpus + 50000;
      const newMonths = Math.max(1, Math.round(previewCalculations.yearsRemaining * 12));
      previewCalculations.requiredSIP = Math.round(requiredSIP(
        previewCalculations.futureValue,
        previewCalculations.expectedReturn,
        newMonths,
        newCorpus
      ));
      previewCalculations.fundingGap = Math.max(0, previewCalculations.futureValue - (newCorpus + previewCalculations.requiredSIP * newMonths));
    } else if (activeScenario.action === "aggressive") {
      previewCalculations.expectedReturn = 13;
      const newMonths = Math.max(1, Math.round(previewCalculations.yearsRemaining * 12));
      previewCalculations.requiredSIP = Math.round(requiredSIP(
        previewCalculations.futureValue,
        13,
        newMonths,
        goal.currentCorpus
      ));
      previewCalculations.fundingGap = Math.max(0, previewCalculations.futureValue - (goal.currentCorpus + previewCalculations.requiredSIP * newMonths));
    }
  }

  const monthsLeft = Math.max(0, Math.round(previewCalculations.yearsRemaining * 12));
  const futureValue = previewCalculations.futureValue;
  const neededSIP = previewCalculations.requiredSIP;
  const gap = previewCalculations.fundingGap;
  const successProb = previewCalculations.successProbability;
  const riskVal = previewCalculations.riskScore;

  // Format helper (strips currency symbol and commas)
  const parseAmount = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;



  const handlePDFExport = async () => {
    setPdfLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { GoalsPDFDocument } = await import("@/lib/pdf-generator");
      const { saveAs } = await import("file-saver");
      
      const goalWithCalculations = {
        ...goal,
        calculations: calculations
      };
      
      const blob = await pdf(<GoalsPDFDocument goals={[goalWithCalculations]} userName="User" />).toBlob();
      saveAs(blob, `GoalWise-Report-${goal.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("Failed to generate PDF", err);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  // Edit Goal Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = {
      name: editName,
      targetAmountToday: Number(editTargetAmount),
      targetDate: new Date(editTargetDate + "-01").toISOString(),
      currentCorpus: Number(editCurrentCorpus),
      currentSIP: Number(editCurrentSIP),
      riskAppetite: editRiskAppetite.toUpperCase(),
      priority: editPriority,
      status: editStatus,
    };

    try {
      if (isDbAvailable) {
        const res = await fetch(`/api/goals/${goal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });
        const result = await res.json();
        if (result.success) {
          mutate();
          // Re-trigger AI recommendations
          await fetch("/api/ai/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goalId: goal.id }),
          });
          mutate();
          toast.success("Goal details updated!");
        } else {
          toast.error(result.error || "Update failed");
        }
      } else {
        // Fallback update
        updateLocalGoal(goal.id, {
          ...updatedFields,
          targetDate: new Date(editTargetDate + "-01"),
          riskAppetite: editRiskAppetite,
          status: editStatus as any,
        });
        toast.success("Goal details updated locally!");
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving changes.");
    }
  };

  // Delete Goal Handler
  const handleDeleteGoal = async () => {
    setIsDeleting(true);

    try {
      if (isDbAvailable) {
        const res = await fetch(`/api/goals/${goal.id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Goal deleted!");
          router.push("/goals");
        } else {
          toast.error(result.error || "Failed to delete");
        }
      } else {
        deleteLocalGoal(goal.id);
        toast.success("Goal deleted locally!");
        router.push("/goals");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting goal.");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Refresh AI recommendations
  const handleRefreshAI = async () => {
    setIsRefreshingAI(true);
    try {
      if (isDbAvailable) {
        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalId: goal.id, force: true }),
        });
        const result = await res.json();
        if (result.success) {
          mutate();
          toast.success("AI Insights updated! ✨");
        } else {
          toast.error("Failed to update AI recommendation");
        }
      } else {
        // Mock fallback refresh
        await new Promise((r) => setTimeout(r, 1500));
        toast.success("AI analysis completed! ✨");
      }
    } catch (err) {
      toast.error("Error generating insights.");
    } finally {
      setIsRefreshingAI(false);
    }
  };

  // Apply Alternative Scenario Handler
  const handleApplyScenario = async (scenario: { label: string; action: string }) => {
    try {
      let updatedFields: any = {};
      
      if (scenario.action === "delay") {
        const date = new Date(goal.targetDate);
        date.setMonth(date.getMonth() + 6);
        updatedFields.targetDate = date.toISOString();
        toast.success("Scenario applied: Target date extended by 6 months.");
      } else if (scenario.action === "lumpsum") {
        updatedFields.currentCorpus = goal.currentCorpus + 50000;
        toast.success("Scenario applied: Added ₹50,000 lump sum corpus.");
      } else if (scenario.action === "aggressive") {
        updatedFields.riskAppetite = "AGGRESSIVE";
        toast.success("Scenario applied: Risk profile switched to Aggressive.");
      }

      if (isDbAvailable) {
        const res = await fetch(`/api/goals/${goal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });
        const result = await res.json();
        if (result.success) {
          mutate();
          // Re-recommend
          await fetch("/api/ai/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goalId: goal.id }),
          });
          mutate();
        }
      } else {
        if (scenario.action === "delay") {
          const date = new Date(goal.targetDate);
          date.setMonth(date.getMonth() + 6);
          updateLocalGoal(goal.id, { targetDate: date });
        } else if (scenario.action === "lumpsum") {
          updateLocalGoal(goal.id, { currentCorpus: goal.currentCorpus + 50000 });
        } else if (scenario.action === "aggressive") {
          updateLocalGoal(goal.id, { riskAppetite: "aggressive" });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply scenario.");
    }
  };

  // Safe breakdown data grouping
  const rawProj = calculations.projectionData || [];
  const breakdownData = rawProj.filter((_: any, i: number) => i % 12 === 0 || i === rawProj.length - 1);

  const statusLabels: Record<string, string> = { ON_TRACK: "On Track", AT_RISK: "At Risk", OFF_TRACK: "Off Track", COMPLETED: "Completed" };
  const statusColors: Record<string, string> = { ON_TRACK: "bg-brand-secondary text-white", AT_RISK: "bg-brand-gold text-[#0A0B14]", OFF_TRACK: "bg-brand-accent text-white", COMPLETED: "bg-text-muted text-white" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-20 md:pb-0 relative"
    >
      {goal.status === "COMPLETED" && <ConfettiRain />}

      {/* Back button */}
      <Link href="/goals" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      {/* Gold Completion Celebration Banner */}
      {goal.status === "COMPLETED" && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/35 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden flex flex-col items-center justify-center space-y-2"
        >
          <div className="absolute inset-0 bg-amber-500/[0.03] animate-pulse" />
          <span className="text-3xl">🏆</span>
          <h2 className="text-lg font-bold text-amber-400 font-jakarta">Congratulations! Goal Completed!</h2>
          <p className="text-xs text-text-secondary max-w-md">
            You have successfully reached your target for <strong>{goal.name}</strong>! Your disciplined systematic investing has turned your wishlist dream into a reality.
          </p>
        </motion.div>
      )}

      {/* What-If Scenario Preview Banner */}
      {activeScenario && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-brand-primary/10 border border-brand-primary/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in duration-300"
        >
          <div>
            <p className="text-xs font-semibold text-brand-primary">🔍 What-If Scenario Preview: {activeScenario.label}</p>
            <p className="text-xs text-text-secondary mt-0.5">{activeScenario.desc} The values shown below are simulated projections.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await handleApplyScenario({ action: activeScenario.action, label: activeScenario.label });
                setActiveScenario(null);
              }}
              className="bg-brand-primary hover:bg-brand-primary/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-glow"
            >
              Apply Permanently
            </button>
            <button
              onClick={() => setActiveScenario(null)}
              className="bg-surface-600/30 hover:bg-surface-600/50 text-text-primary text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset Preview
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Banner */}
      <div className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 sm:p-8 shadow-2xl", goalGradients[goal.type])}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Noise filter overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ filter: "url(#noiseFilter)" }} />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl bg-white/10 p-3 rounded-2xl backdrop-blur-md">{goalEmojis[goal.type] || "🎯"}</span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-jakarta text-2xl sm:text-3xl font-bold text-white leading-tight">{goal.name}</h1>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusColors[goal.status])}>
                  ● {statusLabels[goal.status] || "On Track"}
                </span>
              </div>
              <p className="text-white/70 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Target: <strong>{formatCurrency(goal.targetAmountToday)}</strong></span>
                <span>•</span>
                <span>Date: <strong>{new Date(goal.targetDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</strong></span>
                <span>•</span>
                <span>Horizon: <strong>{calculations.yearsRemaining.toFixed(1)} years</strong></span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-5 bg-black/25 backdrop-blur-md rounded-2xl p-4 self-start md:self-auto min-w-[200px] justify-between">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Success Probability</p>
              <p className="text-2xl font-bold text-white mt-0.5 font-mono-numbers">{successProb}%</p>
              <p className="text-white/40 text-[9px] mt-0.5">Monte Carlo simulation</p>
            </div>
            <div className="h-12 w-12 flex-shrink-0">
              <CircularProgressbar
                value={successProb}
                text={`${successProb}%`}
                styles={buildStyles({
                  textSize: "26px",
                  pathColor: successProb >= 80 ? "#06D6A0" : successProb >= 50 ? "#FFD166" : "#FF6B6B",
                  textColor: "#fff",
                  trailColor: "rgba(255,255,255,0.15)",
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Inflation-Adjusted Target", value: futureValue, subText: `Original: ${formatCurrency(goal.targetAmountToday, { compact: true })}` },
          { label: "Target Monthly SIP", value: neededSIP, subText: `Current SIP: ${formatCurrency(goal.currentSIP, { compact: true })}` },
          { label: "Funding Gap", value: gap, isWarning: gap > 0, subText: gap > 0 ? "Underfunded" : "Fully Funded!" },
          { label: "Lump Sum Alternative", value: requiredLumpSum(futureValue, calculations.expectedReturn, calculations.yearsRemaining), subText: `Savings rate: ${calculations.expectedReturn}%` },
        ].map((metric, i) => (
          <GlassCard key={i} padding="md" className={cn(metric.isWarning && "border-brand-accent/25 bg-brand-accent/[0.01]")}>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{metric.label}</p>
            <p className="text-xl font-bold text-text-primary font-mono-numbers mt-2">
              {formatCurrency(metric.value)}
            </p>
            <p className={cn("text-[11px] mt-1 font-medium", metric.isWarning ? "text-brand-accent" : "text-text-muted")}>
              {metric.subText}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Two Column Layout: Charts and Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col: Charts & Stepper (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabbed Chart Panel */}
          <GlassCard padding="lg" className="min-h-[420px] flex flex-col">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/[0.06] pb-4 mb-6">
              <div>
                <h3 className="font-jakarta font-semibold text-text-primary text-base">Goal Visualizations</h3>
                <p className="text-xs text-text-muted mt-0.5">Explore returns, growth, and inflation erosion forecasts</p>
              </div>
              <div className="flex bg-surface-600/30 rounded-xl p-0.5 overflow-x-auto">
                {[
                  { id: "growth", label: "Corpus Projection" },
                  { id: "sip", label: "SIP vs Target" },
                  { id: "inflation", label: "Inflation Cost" },
                  { id: "breakdown", label: "Breakdown" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200",
                      activeTab === t.id
                        ? "bg-brand-primary text-white shadow-glow"
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-[280px]">
              {activeTab === "growth" && (
                <ErrorBoundary fallbackTitle="Could not load growth chart" fallbackDescription="An error occurred while rendering the growth projections area chart.">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={rawProj} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="year" stroke="rgba(155,155,192,0.4)" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}Y`} />
                      <YAxis stroke="rgba(155,155,192,0.4)" fontSize={10} tickLine={false} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="glass-elevated rounded-xl p-3 border border-brand-primary/20 text-xs">
                              <p className="font-semibold text-text-primary mb-1">Year {data.year}</p>
                              <p className="text-brand-primary font-mono-numbers">Accumulated: {formatCurrency(data.corpus)}</p>
                              <p className="text-text-muted font-mono-numbers">Invested: {formatCurrency(data.invested)}</p>
                            </div>
                          );
                        }}
                      />
                      <Area type="monotone" dataKey="corpus" name="Projected Corpus" stroke="#6C63FF" strokeWidth={2.5} fill="url(#corpusGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              )}

              {activeTab === "sip" && (
                <ErrorBoundary fallbackTitle="Could not load SIP chart" fallbackDescription="An error occurred while rendering the SIP Progress chart.">
                  <SIPProgressChart projectionData={rawProj} targetAmount={futureValue} />
                </ErrorBoundary>
              )}

              {activeTab === "inflation" && (
                <ErrorBoundary fallbackTitle="Could not load inflation chart" fallbackDescription="An error occurred while rendering the inflation erosion chart.">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={rawProj} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="year" stroke="rgba(155,155,192,0.4)" fontSize={10} tickFormatter={(v) => `${v}Y`} />
                      <YAxis stroke="rgba(155,155,192,0.4)" fontSize={10} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="glass-elevated rounded-xl p-3 border border-brand-primary/20 text-xs">
                              <p className="font-semibold text-text-primary mb-1">Year {data.year}</p>
                              <p className="text-brand-secondary font-mono-numbers">Invested: {formatCurrency(data.invested)}</p>
                              <p className="text-brand-accent font-mono-numbers">Purchasing Power Erosion: {formatCurrency(data.withoutInvestment)}</p>
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10, color: "#9B8FFF" }} />
                      <Line type="monotone" dataKey="invested" name="Systematic Investing" stroke="#06D6A0" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="withoutInvestment" name="Holding Cash (Eroded)" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              )}

              {activeTab === "breakdown" && (
                <div className="overflow-y-auto max-h-[300px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-text-muted text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2.5">Timeline</th>
                        <th className="py-2.5">Total Invested</th>
                        <th className="py-2.5">Projected Value</th>
                        <th className="py-2.5">Returns Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {breakdownData.map((d: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-3 font-semibold text-text-primary">Year {d.year}</td>
                          <td className="py-3 font-mono-numbers text-text-secondary">{formatCurrency(d.invested)}</td>
                          <td className="py-3 font-mono-numbers text-brand-primary font-bold">{formatCurrency(d.corpus)}</td>
                          <td className="py-3 font-mono-numbers text-brand-secondary">{formatCurrency(Math.max(0, d.corpus - d.invested))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Stepper timeline */}
          <GlassCard padding="lg">
            <h3 className="font-jakarta font-semibold text-text-primary text-base mb-6">Goal Completion Stepper</h3>
            <ErrorBoundary fallbackTitle="Could not load timeline milestones" fallbackDescription="Timeline milestones visualizer failed to initialize.">
              <GoalTimelineChart
                goalName={goal.name}
                startDate={new Date(goal.createdAt || Date.now())}
                targetDate={new Date(goal.targetDate)}
                currentCorpus={goal.currentCorpus}
                targetAmount={futureValue}
                projectionData={rawProj}
              />
            </ErrorBoundary>
          </GlassCard>

          {/* Recommended Instruments */}
          {goal.aiInsights?.instruments && (
            <GlassCard padding="lg">
              <h3 className="font-jakarta font-semibold text-text-primary text-base mb-4">
                Recommended Allocation Mutual Funds
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-caption uppercase text-text-muted tracking-wider pb-3">Instrument</th>
                      <th className="text-caption uppercase text-text-muted tracking-wider pb-3">Allocation</th>
                      <th className="text-caption uppercase text-text-muted tracking-wider pb-3">Expected Return</th>
                      <th className="text-caption uppercase text-text-muted tracking-wider pb-3">Risk Tier</th>
                      <th className="text-right text-caption uppercase text-text-muted tracking-wider pb-3">Monthly Outlay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goal.aiInsights.instruments.map((inst: any, i: number) => (
                      <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 text-xs font-semibold text-text-primary">{inst.name}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-surface-600/50 overflow-hidden">
                              <div className="h-full rounded-full bg-brand-primary" style={{ width: `${inst.allocation}%` }} />
                            </div>
                            <span className="text-xs font-mono-numbers text-text-secondary">{inst.allocation}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-xs text-text-secondary font-mono-numbers">{inst.expectedReturn}</td>
                        <td className="py-3">
                          <span className={cn("text-[9px] rounded-full px-2 py-0.5 font-bold uppercase",
                            inst.risk === "Low" || inst.risk === "Very Low" ? "bg-brand-secondary/10 text-brand-secondary"
                            : inst.risk === "Moderate" ? "bg-brand-gold/10 text-brand-gold"
                            : "bg-brand-accent/10 text-brand-accent"
                          )}>{inst.risk}</span>
                        </td>
                        <td className="py-3 text-right text-xs font-semibold text-text-primary font-mono-numbers">
                          {formatCurrency(Math.round(neededSIP * inst.allocation / 100))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* Alternative Scenarios cards */}
          <div className="space-y-4">
            <h3 className="font-jakarta font-semibold text-text-primary text-base">Explore Alternative Scenarios</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Delay Goal by 6 mo", value: formatCurrency(Math.round(neededSIP * 0.82)), impact: "Lowers monthly SIP outlay by 18%", action: "delay", desc: "Extending your time horizon lets compounding work longer." },
                { label: "Inject ₹50K Lump Sum", value: formatCurrency(Math.round(neededSIP * 0.86)), impact: "Reduces monthly SIP outlay by 14%", action: "lumpsum", desc: "Adds an immediate capital booster to start generating returns." },
                { label: "Switch to Aggressive Risk", value: formatCurrency(Math.round(neededSIP * 0.75)), impact: "Lowers required SIP outlay by 25%", action: "aggressive", desc: "Increases stock index weights for a higher expected CAGR." },
              ].map((sc, i) => (
                <GlassCard key={i} padding="md" className="flex flex-col justify-between hover:border-brand-primary/30 transition-all group">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-text-primary">{sc.label}</p>
                    <p className="text-lg font-bold text-brand-primary font-mono-numbers">{sc.value}<span className="text-[10px] text-text-muted">/mo</span></p>
                    <p className="text-[10px] text-brand-secondary font-semibold">{sc.impact}</p>
                    <p className="text-[10px] text-text-muted leading-relaxed pt-1 border-t border-white/[0.04]">{sc.desc}</p>
                  </div>
                  <button
                    onClick={() => setActiveScenario({ ...sc, value: parseAmount(sc.value) })}
                    className="w-full text-center py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg text-[10px] font-bold transition-all mt-4 border border-brand-primary/10"
                  >
                    Preview Scenario
                  </button>
                </GlassCard>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: AI & Risk Assessment Details (1 col) */}
        <div className="space-y-6">

          {/* Risk Gauge */}
          <GlassCard padding="lg" className="flex flex-col items-center">
            <h3 className="font-jakarta font-semibold text-text-primary text-base self-start mb-4">Risk Appetite Gauge</h3>
            <ErrorBoundary fallbackTitle="Could not load risk gauge" fallbackDescription="The risk profile needle gauge visualizer could not be rendered.">
              <RiskGaugeChart score={riskVal} />
            </ErrorBoundary>
            <div className="w-full border-t border-white/[0.06] mt-4 pt-4 text-center">
              <p className="text-xs text-text-muted leading-relaxed">
                Your selected risk profile is <strong className="text-text-primary capitalize">{goal.riskAppetite.toLowerCase()}</strong>. This translates to an expected portfolio growth rate of <strong>{calculations.expectedReturn}% CAGR</strong>.
              </p>
            </div>
          </GlassCard>

          {/* AI Insights Card */}
          <GlassCard elevated padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-primary animate-pulse" />
                <h3 className="font-jakarta font-semibold text-text-primary text-base">AI Advisory Insights</h3>
              </div>
              <button
                onClick={handleRefreshAI}
                disabled={isRefreshingAI}
                className="text-text-muted hover:text-text-primary p-1.5 bg-surface-600/30 hover:bg-surface-600/50 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshingAI && "animate-spin")} />
                Refresh
              </button>
            </div>

            {isRefreshingAI ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
                <p className="text-xs text-text-muted">Re-generating recommendations...</p>
              </div>
            ) : (
              <>
                {goal.aiInsights?.explanation && (
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {typedExplanation}
                    {!typewriterComplete && (
                      <span className="inline-block w-1.5 h-3.5 bg-brand-primary ml-1 animate-pulse" />
                    )}
                  </p>
                )}

                {goal.aiInsights?.insights && goal.aiInsights.insights.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {goal.aiInsights.insights.map((insight: any, i: number) => {
                      const config = (insightTypeConfig as any)[insight.type] || insightTypeConfig.suggestion;
                      const Icon = config.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl p-2.5 border border-white/[0.04] bg-surface-600/10 hover:bg-surface-600/20 transition-colors"
                        >
                          <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg flex-shrink-0 mt-0.5", config.bg)}>
                            <Icon className={cn("h-3 w-3", config.color)} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-text-primary leading-snug">{insight.text}</p>
                            <p className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wide">Impact: {insight.impact}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </GlassCard>

          {/* Risk Warnings */}
          {goal.aiInsights?.riskWarning && (
            <div className="rounded-2xl bg-brand-accent/5 border border-brand-accent/15 p-4 flex items-start gap-3">
              <AlertTriangle className="h-4.5 w-4.5 text-brand-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">{goal.aiInsights.riskWarning}</p>
            </div>
          )}

          {/* Action Buttons list */}
          <div className="grid gap-2.5">
            <button
              onClick={() => setIsAutoSipModalOpen(true)}
              className="gradient-cta text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-glow transition-all"
            >
              <Play className="h-4 w-4" /> Start Auto-SIP
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="border border-white/[0.08] text-text-primary bg-surface-800/40 hover:bg-surface-600/30 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Pencil className="h-4 w-4" /> Edit Goal Parameters
            </button>
            <button
              onClick={handlePDFExport}
              disabled={pdfLoading}
              className="border border-white/[0.08] text-text-secondary hover:text-text-primary bg-surface-850 hover:bg-surface-600/20 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {pdfLoading ? "Compiling PDF..." : "Export Financial PDF"}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard! Share it with family.");
              }}
              className="border border-white/[0.08] text-text-secondary hover:text-text-primary bg-surface-850 hover:bg-surface-600/20 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="h-4 w-4" /> Share Road Map
            </button>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isDeleting}
              className="border border-brand-accent/20 hover:bg-brand-accent/5 text-brand-accent font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="h-4 w-4" /> Delete Goal
            </button>
          </div>

        </div>

      </div>

      {/* Edit Modal Dialog */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface-900 border border-white/[0.08] rounded-3xl p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-primary" />
                  <h3 className="font-jakarta font-bold text-text-primary text-base">Edit Goal Parameters</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-text-muted hover:text-text-primary p-1 bg-surface-600/20 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">Goal Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">Target Amount Today (₹)</label>
                    <input
                      type="number"
                      required
                      value={editTargetAmount}
                      onChange={(e) => setEditTargetAmount(e.target.value)}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary font-mono-numbers focus:border-brand-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">Target Date</label>
                    <input
                      type="month"
                      required
                      value={editTargetDate}
                      onChange={(e) => setEditTargetDate(e.target.value)}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">Current Savings (₹)</label>
                    <input
                      type="number"
                      value={editCurrentCorpus}
                      onChange={(e) => setEditCurrentCorpus(e.target.value)}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary font-mono-numbers focus:border-brand-primary/40 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">Monthly SIP (₹)</label>
                    <input
                      type="number"
                      value={editCurrentSIP}
                      onChange={(e) => setEditCurrentSIP(e.target.value)}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary font-mono-numbers focus:border-brand-primary/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1.5">Goal Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 mb-4 [&>option]:bg-surface-800"
                  >
                    <option value="ON_TRACK">On Track</option>
                    <option value="AT_RISK">At Risk</option>
                    <option value="OFF_TRACK">Off Track</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1.5">Risk Appetite Profile</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "conservative", label: "Conservative" },
                      { type: "balanced", label: "Balanced" },
                      { type: "aggressive", label: "Aggressive" },
                    ].map((risk) => (
                      <button
                        key={risk.type}
                        type="button"
                        onClick={() => setEditRiskAppetite(risk.type as any)}
                        className={cn(
                          "py-2 px-3 text-xs rounded-xl border text-center font-semibold transition-all",
                          editRiskAppetite === risk.type
                            ? "border-brand-primary bg-brand-primary/10 text-text-primary"
                            : "border-white/[0.04] bg-surface-600/20 text-text-muted"
                        )}
                      >
                        {risk.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-text-muted block mb-1">Goal Priority</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditPriority(star)}
                        className={cn("text-2xl transition-colors", star <= editPriority ? "text-brand-gold" : "text-text-muted/30")}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06] mt-5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-cta text-white font-semibold px-5 py-2.5 rounded-xl text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-SIP Platform Dialog */}
      <AnimatePresence>
        {isAutoSipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAutoSipModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface-900 border border-white/[0.08] rounded-3xl p-6 w-full max-w-md relative z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-primary" />
                  <h3 className="font-jakarta font-bold text-text-primary text-base">Select Investment Platform</h3>
                </div>
                <button
                  onClick={() => setIsAutoSipModalOpen(false)}
                  className="text-text-muted hover:text-text-primary p-1 bg-surface-600/20 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-text-muted mb-4">
                To start your monthly Auto-SIP of <strong>{formatCurrency(neededSIP)}</strong> for this goal, select your preferred Indian wealth platform below.
              </p>

              <div className="space-y-3">
                {[
                  { name: "Groww", desc: "Direct Mutual Funds, zero commissions", url: "https://groww.in/mutual-funds", color: "hover:border-[#00D09C]/40 bg-[#00D09C]/5 hover:bg-[#00D09C]/10 text-[#00D09C]" },
                  { name: "Zerodha Coin", desc: "Invest via Coin in Demat Mode", url: "https://coin.zerodha.com/", color: "hover:border-[#EE5433]/40 bg-[#EE5433]/5 hover:bg-[#EE5433]/10 text-[#EE5433]" },
                  { name: "INDmoney", desc: "Track and invest in one unified app", url: "https://www.indmoney.com/", color: "hover:border-[#0052FF]/40 bg-[#0052FF]/5 hover:bg-[#0052FF]/10 text-[#0052FF]" },
                  { name: "Kuvera", desc: "Direct plans, family goals, no cost", url: "https://kuvera.in/", color: "hover:border-[#38A169]/40 bg-[#38A169]/5 hover:bg-[#38A169]/10 text-[#38A169]" }
                ].map((plat) => (
                  <a
                    key={plat.name}
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.04] transition-all duration-300 group",
                      plat.color
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold text-text-primary">{plat.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{plat.desc}</p>
                    </div>
                    <span className="text-xs font-semibold text-text-primary group-hover:translate-x-1 transition-transform">
                      Go →
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden SVG Noise Filter */}
      <svg className="absolute w-0 h-0 opacity-0 pointer-events-none" aria-hidden="true">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>

      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteGoal}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goal.name}"? This will permanently wipe all compound calculations and timeline milestones. This cannot be undone.`}
        isLoading={isDeleting}
      />
    </motion.div>
  );
}
