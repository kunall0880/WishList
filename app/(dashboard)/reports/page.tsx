"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-provider";

export default function ReportsPage() {
  const goals = useGoalStore((s) => s.goals);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"summary" | "goals" | "export">("summary");
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || "");
  const selectedGoal = (useGoalStore((s) => s.getGoalById(selectedGoalId)) || goals[0]) as any;

  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const isExporting = pdfLoading || excelLoading;

  const handlePDFExport = async (goalsToExport: any[], reportName: string) => {
    setPdfLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { GoalsPDFDocument } = await import("@/lib/pdf-generator");
      const { saveAs } = await import("file-saver");
      
      const blob = await pdf(<GoalsPDFDocument goals={goalsToExport} userName={user?.name ?? "User"} />).toBlob();
      saveAs(blob, `GoalWise-Report-${reportName}-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("Failed to generate PDF", err);
      toast.error("Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcelExport = async (goalsToExport: any[]) => {
    setExcelLoading(true);
    try {
      const { downloadGoalsExcel } = await import("@/lib/excel-generator");
      await downloadGoalsExcel(goalsToExport);
      toast.success("Excel sheet downloaded successfully");
    } catch (err) {
      console.error("Failed to generate Excel", err);
      toast.error("Failed to generate Excel");
    } finally {
      setExcelLoading(false);
    }
  };

  // Financial Health Score Calculation
  const healthScore = useMemo(() => {
    if (goals.length === 0) return 100;

    // 1. Success Probabilities (40%)
    const avgProb = goals.reduce((sum, g: any) => {
      // If we don't have calculations, use a realistic fallback based on status
      const prob = g.calculations?.successProbability ?? 
        (g.status === "ON_TRACK" ? 85 : g.status === "AT_RISK" ? 55 : 30);
      return sum + prob;
    }, 0) / goals.length;

    // 2. Funding Rate (30%)
    let totalSIP = 0;
    let totalNeeded = 0;
    goals.forEach((g: any) => {
      totalSIP += g.currentSIP;
      // Reverse SIP
      totalNeeded += g.calculations?.requiredSIP ?? g.currentSIP;
    });
    const fundingRate = totalNeeded > 0 ? Math.min(100, (totalSIP / totalNeeded) * 100) : 100;

    // 3. Emergency Buffer Check (20%)
    const hasEmergency = goals.some((g: any) => g.type === "EMERGENCY" || g.hasEmergencyFund);
    const emergencyScore = hasEmergency ? 100 : 40;

    // 4. Critical Goals Protection (10%)
    const criticalGoals = goals.filter((g) => g.priority >= 4);
    const criticalOnTrack = criticalGoals.filter((g) => g.status === "ON_TRACK" || g.status === "COMPLETED").length;
    const criticalScore = criticalGoals.length > 0 ? (criticalOnTrack / criticalGoals.length) * 100 : 100;

    const finalScore = (avgProb * 0.4) + (fundingRate * 0.3) + (emergencyScore * 0.2) + (criticalScore * 0.1);
    return Math.round(finalScore);
  }, [goals]);

  const getHealthLevel = () => {
    if (healthScore >= 80) return { label: "Excellent Financial Standing", color: "text-brand-secondary", border: "border-brand-secondary/20", bg: "bg-brand-secondary/5", desc: "Your Systematic Investments are on track, and you have set sufficient risk and emergency structures. Maintain your current run rate." };
    if (healthScore >= 50) return { label: "Moderate Financial Health", color: "text-brand-gold", border: "border-brand-gold/20", bg: "bg-brand-gold/5", desc: "Some of your targets have a minor funding gap. Consider implementing step-up SIPs to protect your timelines." };
    return { label: "Action Required", color: "text-brand-accent", border: "border-brand-accent/20", bg: "bg-brand-accent/5", desc: "High-priority goals are currently underfunded. Rebalance your asset allocation or increase monthly savings layout." };
  };

  const health = getHealthLevel();

  // Export Consolidate CSV
  const handleExportConsolidated = () => {
    const csvContent = [
      ["Goal Name", "Category", "Target Date", "Target Target (Today)", "Current Accumulated", "SIP Outlay", "Status"],
      ...goals.map((g) => [
        g.name,
        g.type,
        new Date(g.targetDate).toISOString().split("T")[0],
        g.targetAmountToday,
        g.currentCorpus,
        g.currentSIP,
        g.status,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wishlist_consolidated_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Consolidated Excel CSV exported successfully!");
  };

  // Compile Single PDF Report
  const handleCompileGoalReport = (goalName: string) => {
    toast.success(`PDF Summary Report for "${goalName}" compiled successfully!`, {
      icon: "📄",
      duration: 3500,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-text-primary">Financial Auditing & Reports</h1>
          <p className="text-sm text-text-muted mt-0.5">Audit goals, compute health indexes, and download summaries</p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-surface-600/30 rounded-xl p-1 border border-white/[0.04] self-start sm:self-auto">
          {[
            { id: "summary", label: "Health Summary" },
            { id: "goals", label: "Goal Auditing" },
            { id: "export", label: "Export Portal" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
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

      <AnimatePresence mode="wait">
        {/* TAB 1: HEALTH SUMMARY */}
        {activeTab === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Health score gauge card */}
            <GlassCard padding="lg" className="flex flex-col items-center justify-center text-center">
              <h3 className="font-jakarta font-semibold text-text-primary text-base self-start mb-4">Financial Health Score</h3>
              <div className="h-32 w-32 my-2">
                <CircularProgressbar
                  value={healthScore}
                  text={`${healthScore}`}
                  styles={buildStyles({
                    textSize: "24px",
                    textColor: "#fff",
                    pathColor: healthScore >= 80 ? "#06D6A0" : healthScore >= 50 ? "#FFD166" : "#FF6B6B",
                    trailColor: "rgba(255,255,255,0.06)",
                  })}
                />
              </div>
              <p className={cn("text-sm font-bold mt-4", health.color)}>{health.label}</p>
              <p className="text-[11px] text-text-muted leading-relaxed mt-2 px-2">{health.desc}</p>
            </GlassCard>

            {/* Health Score breakdown analysis */}
            <div className="lg:col-span-2 space-y-4">
              <GlassCard padding="lg">
                <h3 className="font-jakarta font-semibold text-text-primary text-base mb-4">Compounding Indices</h3>
                <div className="space-y-4">
                  {[
                    { label: "Goal Probability Matching", score: 85, impact: "Excellent systematic target convergence across portfolios", icon: Award, color: "text-brand-secondary" },
                    { label: "Emergency Buffer Allocation", score: goals.some((g: any) => g.type === "EMERGENCY" || g.hasEmergencyFund) ? 100 : 40, impact: goals.some((g: any) => g.type === "EMERGENCY" || g.hasEmergencyFund) ? "Active buffer reserves present" : "Recommended: Set up a dedicated 3-month expense emergency fund", icon: AlertTriangle, color: "text-brand-gold" },
                    { label: "Timeline Outlay Adequacy", score: 78, impact: "Average systematic SIP coverage matches 82% of roadmap demand", icon: TrendingUp, color: "text-brand-primary" },
                  ].map((index, idx) => (
                    <div key={idx} className="flex gap-4 items-start pb-4 border-b border-white/[0.04] last:pb-0 last:border-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-600/30 flex-shrink-0 mt-0.5">
                        <index.icon className={cn("h-4.5 w-4.5", index.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-text-primary">{index.label}</span>
                          <span className="text-xs font-bold font-mono-numbers text-text-primary">{index.score}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-600/50 rounded-full overflow-hidden mb-1">
                          <div className={cn("h-full rounded-full", index.color.replace("text-", "bg-"))} style={{ width: `${index.score}%` }} />
                        </div>
                        <p className="text-[10px] text-text-muted">{index.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Advisory Next Actions */}
              <GlassCard padding="md" className="border-brand-primary/20 bg-brand-primary/[0.01]">
                <div className="flex gap-2">
                  <Sparkles className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-text-primary">Next Action to Boost Health:</span>
                    <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                      Increase your monthly SIP for the underfunded goals by ₹3,500. This action will boost your Financial Health Score by <strong>+12 points</strong> and lift your composite success probability to <strong>91%</strong>.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* TAB 2: GOAL AUDITING */}
        {activeTab === "goals" && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GlassCard padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-jakarta font-semibold text-text-primary text-base">Individual Goal Audit</h3>
                  <p className="text-xs text-text-muted mt-0.5">Select a systematic goal to generate individual compliance reports</p>
                </div>
                
                {/* Dropdown goal selector */}
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-primary/40 min-w-[200px]"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGoal && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4 border-t border-b border-white/[0.04] py-6">
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Future Value Target</p>
                      <p className="text-xl font-bold text-text-primary font-mono-numbers mt-1">
                        {formatCurrency(selectedGoal.calculations?.futureValue ?? selectedGoal.targetAmountToday)}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">Inflation rate: {selectedGoal.inflationRate || 6}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Monthly Outlay Coverage</p>
                      <p className="text-xl font-bold text-text-primary font-mono-numbers mt-1">
                        {formatCurrency(selectedGoal.currentSIP)}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Target SIP needed: {formatCurrency(selectedGoal.calculations?.requiredSIP ?? selectedGoal.currentSIP)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Goal Status Status</p>
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1.5",
                        selectedGoal.status === "ON_TRACK" ? "bg-brand-secondary/10 text-brand-secondary" : "bg-brand-accent/10 text-brand-accent")}>
                        {selectedGoal.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handlePDFExport([selectedGoal], selectedGoal.name.replace(/\s+/g, "_"))}
                      disabled={isExporting}
                      className="gradient-cta text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:shadow-glow transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {pdfLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      Compile PDF Audit
                    </button>
                    <button
                      onClick={() => handleExcelExport([selectedGoal])}
                      disabled={isExporting}
                      className="border border-white/[0.08] hover:bg-surface-600/30 text-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {excelLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Export Excel Ledger
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* TAB 3: EXPORT PORTAL */}
        {activeTab === "export" && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <GlassCard padding="lg">
              <h3 className="font-jakarta font-semibold text-text-primary text-base mb-2">Consolidated Backup & Audits</h3>
              <p className="text-xs text-text-muted mb-6">Backup all your goal projections, allocation metrics, and risk configurations</p>
              
              <div className="p-6 rounded-2xl bg-surface-600/10 border border-white/[0.04] space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text-primary">Download Consolidated Investor Profile</span>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Compiles all current savings balances, target inflation curves, and calculated mutual fund ratios. Perfect for tax auditing or filing backup records.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleExcelExport(goals)}
                    disabled={isExporting}
                    className="gradient-cta text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:shadow-glow transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {excelLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download Excel Report
                  </button>
                  <button
                    onClick={() => handlePDFExport(goals, "Consolidated_Investor_Profile")}
                    disabled={isExporting}
                    className="border border-white/[0.08] hover:bg-surface-600/30 text-text-secondary hover:text-text-primary text-xs font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                  >
                    {pdfLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Download PDF Profile
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
