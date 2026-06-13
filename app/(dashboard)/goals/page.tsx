"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronRight,
  Download,
  Filter,
  Target,
  Trash,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Loader2,
  FileText,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useGoalStore } from "@/store/useGoalStore";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import type { Goal } from "@/types";
import toast from "react-hot-toast";
import useSWR from "swr";
import { inflationAdjustedFV, requiredSIP } from "@/lib/financial-engine";
import { useAuth } from "@/lib/auth-provider";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

const statusColors: Record<string, string> = {
  ON_TRACK: "bg-brand-secondary/10 text-brand-secondary",
  AT_RISK: "bg-brand-gold/10 text-brand-gold",
  OFF_TRACK: "bg-brand-accent/10 text-brand-accent",
  COMPLETED: "bg-text-muted/10 text-text-muted",
};

const statusLabels: Record<string, string> = {
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  OFF_TRACK: "Off Track",
  COMPLETED: "Completed",
};

const riskColors: Record<string, string> = {
  CONSERVATIVE: "bg-brand-secondary/10 text-brand-secondary",
  BALANCED: "bg-brand-gold/10 text-brand-gold",
  AGGRESSIVE: "bg-brand-accent/10 text-brand-accent",
  conservative: "bg-brand-secondary/10 text-brand-secondary",
  balanced: "bg-brand-gold/10 text-brand-gold",
  aggressive: "bg-brand-accent/10 text-brand-accent",
};

const goalEmojis: Record<string, string> = {
  TRAVEL: "🌍", HOUSE: "🏠", CAR: "🚗", EDUCATION: "🎓", WEDDING: "💍",
  EMERGENCY: "🛡️", RETIREMENT: "👴", BUSINESS: "🚀", BIKE: "🏍️",
  GADGET: "💻", RENOVATION: "🏗️", OTHER: "🎯",
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GoalsPage() {
  const localGoals = useGoalStore((state) => state.goals);
  const deleteLocalGoal = useGoalStore((state) => state.deleteGoal);
  const { user } = useAuth();

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

  // SWR for API fetching
  const { data: apiData, mutate, isLoading } = useSWR("/api/goals", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const isDbAvailable = apiData && apiData.success;
  const goals = isDbAvailable ? apiData.data : localGoals;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<string>("targetDate");
  const [sortAsc, setSortAsc] = useState(true);

  // Bulk actions states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete Confirmation Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate calculations helper on the fly if not returned by server (local fallback)
  const getGoalCalcs = (g: any) => {
    if (g.calculations) return g.calculations;

    const targetDate = new Date(g.targetDate);
    const msRemaining = targetDate.getTime() - Date.now();
    const yearsRemaining = Math.max(0.5, msRemaining / (1000 * 60 * 60 * 24 * 365.25));
    const monthsRemaining = Math.max(1, Math.round(yearsRemaining * 12));

    const riskReturnMap: Record<string, number> = {
      CONSERVATIVE: 7,
      BALANCED: 10,
      AGGRESSIVE: 13,
      conservative: 7,
      balanced: 10,
      aggressive: 13,
    };
    const expectedReturn = riskReturnMap[g.riskAppetite] ?? 10;

    const futureValue = inflationAdjustedFV(g.targetAmountToday, g.inflationRate || 6, yearsRemaining);
    const needed = requiredSIP(futureValue, expectedReturn, monthsRemaining, g.currentCorpus);
    const gap = Math.max(0, needed - g.currentSIP);

    return {
      futureValue: Math.round(futureValue),
      requiredSIP: Math.round(needed),
      fundingGap: Math.round(gap),
    };
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeletingSingle(true);
    try {
      if (isDbAvailable) {
        const res = await fetch(`/api/goals/${deleteTargetId}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
          mutate();
          toast.success(`"${deleteTargetName}" deleted successfully`);
        } else {
          toast.error(result.error || "Failed to delete");
        }
      } else {
        deleteLocalGoal(deleteTargetId);
        toast.success(`"${deleteTargetName}" deleted locally`);
      }
    } catch (e) {
      toast.error("Error deleting goal");
    } finally {
      setIsDeletingSingle(false);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  // Bulk actions handlers
  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredItems: any[]) => {
    const filteredItemIds = filteredItems.map((g) => g.id);
    const allSelected = filteredItemIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Unselect all filtered items
      setSelectedIds((prev) => prev.filter((id) => !filteredItemIds.includes(id)));
    } else {
      // Select all filtered items
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredItemIds])));
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setIsDeletingBulk(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        if (isDbAvailable) {
          const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) successCount++;
        } else {
          deleteLocalGoal(id);
          successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (isDbAvailable) mutate();
    toast.success(`Successfully deleted ${successCount} goals.`);
    setSelectedIds([]);
    setIsDeletingBulk(false);
    setBulkDeleteConfirmOpen(false);
  };

  const handleBulkExport = (selectedGoals: any[]) => {
    const csvContent = [
      ["Goal Name", "Type", "Target Date", "Target Amount", "Future Value", "Current Corpus", "Monthly SIP", "Risk Appetite", "Status"],
      ...selectedGoals.map((g) => {
        const calcs = getGoalCalcs(g);
        return [
          g.name,
          g.type,
          new Date(g.targetDate).toISOString().split("T")[0],
          g.targetAmountToday,
          calcs.futureValue,
          g.currentCorpus,
          g.currentSIP,
          g.riskAppetite,
          g.status,
        ];
      }),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wishlist_goals_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  // Filter logic
  const filteredGoals = goals
    .filter((g: any) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || g.status === statusFilter;
      const matchesRisk = riskFilter === "ALL" || g.riskAppetite.toUpperCase() === riskFilter.toUpperCase();
      const matchesType = typeFilter === "ALL" || g.type === typeFilter;

      return matchesSearch && matchesStatus && matchesRisk && matchesType;
    })
    .sort((a: any, b: any) => {
      let aVal = a[sortBy as keyof Goal];
      let bVal = b[sortBy as keyof Goal];

      // Custom calculation sorting
      if (sortBy === "futureValue" || sortBy === "requiredSIP" || sortBy === "fundingGap") {
        aVal = getGoalCalcs(a)[sortBy];
        bVal = getGoalCalcs(b)[sortBy];
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortAsc ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredGoals.length / itemsPerPage);
  const paginatedGoals = filteredGoals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goalTypes = Array.from(new Set(goals.map((g: any) => g.type))) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-20 md:pb-0 relative min-h-[80vh]"
    >
      {/* Mobile Floating Action Button (FAB) */}
      <Link
        href="/goals/new"
        className="fixed bottom-24 right-6 md:hidden z-40 bg-brand-primary p-4 rounded-full text-white shadow-glow hover:scale-105 active:scale-95 transition-all"
        title="Add Goal"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-text-primary">
            Goal Roadmap
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Track, simulate, and edit your systematic financial goals</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => handleBulkExport(filteredGoals)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/[0.08] rounded-xl px-3 py-2 transition-colors bg-surface-650/40"
          >
            <Download className="h-3.5 w-3.5" />
            Export All CSV
          </button>
          <button
            onClick={() => handlePDFExport(goals, "Consolidated_Roadmap")}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/[0.08] rounded-xl px-3 py-2 transition-colors bg-surface-650/40 disabled:opacity-50 disabled:pointer-events-none"
          >
            {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            Export PDF
          </button>
          <button
            onClick={() => handleExcelExport(goals)}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/[0.08] rounded-xl px-3 py-2 transition-colors bg-surface-650/40 disabled:opacity-50 disabled:pointer-events-none"
          >
            {excelLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export Excel
          </button>
          <Link
            href="/goals/new"
            className="hidden md:flex gradient-cta text-white text-sm font-semibold px-4 py-2 rounded-xl items-center gap-1.5 hover:shadow-glow transition-shadow"
          >
            <Plus className="h-4 w-4" />
            Add Goal
          </Link>
        </div>
      </div>

      {/* Search + Filters Dropdowns */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search goals by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors placeholder:text-text-muted"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase text-text-muted block mb-1 font-semibold">Goal Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs rounded-xl bg-surface-600/50 border border-white/[0.06] px-3 py-2 text-text-primary focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="OFF_TRACK">Off Track</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-text-muted block mb-1 font-semibold">Risk Level</label>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs rounded-xl bg-surface-600/50 border border-white/[0.06] px-3 py-2 text-text-primary focus:outline-none"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CONSERVATIVE">Conservative</option>
              <option value="BALANCED">Balanced</option>
              <option value="AGGRESSIVE">Aggressive</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-text-muted block mb-1 font-semibold">Goal Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs rounded-xl bg-surface-600/50 border border-white/[0.06] px-3 py-2 text-text-primary focus:outline-none"
            >
              <option value="ALL">All Types</option>
              {goalTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-3.5 bg-brand-primary/10 border border-brand-primary/25 rounded-2xl"
          >
            <span className="text-xs font-semibold text-brand-primary">
              {selectedIds.length} goals selected
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBulkExport(goals.filter((g: any) => selectedIds.includes(g.id)))}
                className="flex items-center gap-1.5 text-xs text-text-primary bg-surface-600/60 border border-white/[0.06] hover:bg-surface-650 rounded-xl px-3 py-1.5 transition-all font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
              </button>
              <button
                onClick={() => handlePDFExport(goals.filter((g: any) => selectedIds.includes(g.id)), `Selected_Goals_${selectedIds.length}`)}
                disabled={isExporting}
                className="flex items-center gap-1.5 text-xs text-text-primary bg-surface-600/60 border border-white/[0.06] hover:bg-surface-650 rounded-xl px-3 py-1.5 transition-all font-semibold disabled:opacity-50 disabled:pointer-events-none"
              >
                {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                Export Selected PDF ({selectedIds.length})
              </button>
              <button
                onClick={() => handleExcelExport(goals.filter((g: any) => selectedIds.includes(g.id)))}
                disabled={isExporting}
                className="flex items-center gap-1.5 text-xs text-text-primary bg-surface-600/60 border border-white/[0.06] hover:bg-surface-650 rounded-xl px-3 py-1.5 transition-all font-semibold disabled:opacity-50 disabled:pointer-events-none"
              >
                {excelLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Export Selected Excel ({selectedIds.length})
              </button>
              <button
                onClick={() => setBulkDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 text-xs text-brand-accent bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 rounded-xl px-3 py-1.5 transition-all font-semibold"
              >
                <Trash className="h-3.5 w-3.5" /> Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-text-muted hover:text-text-primary px-2 py-1"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Container */}
      <GlassCard padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <span className="animate-spin h-8 w-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full" />
              <p className="text-xs text-text-muted font-medium">Fetching goals list...</p>
            </div>
          ) : paginatedGoals.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Target className="h-10 w-10 text-text-muted mx-auto" />
              <h3 className="font-semibold text-text-primary text-sm">No matching goals found</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto">Try clearing search text or adjusting filters.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-surface-600/10">
                  <th className="px-4 py-3 w-10">
                    <button
                      onClick={() => handleSelectAll(paginatedGoals)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      {paginatedGoals.every((g: any) => selectedIds.includes(g.id)) ? (
                        <CheckSquare className="h-4 w-4 text-brand-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  {[
                    { key: "name", label: "Goal" },
                    { key: "targetDate", label: "Target Date" },
                    { key: "targetAmountToday", label: "Today's Cost" },
                    { key: "futureValue", label: "Future Value (Inflation Adj)" },
                    { key: "currentCorpus", label: "Accumulated" },
                    { key: "requiredSIP", label: "Required SIP" },
                    { key: "fundingGap", label: "Shortfall" },
                    { key: "riskAppetite", label: "Risk Appetite" },
                    { key: "status", label: "Status" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="text-caption uppercase text-text-muted tracking-wider px-4 py-3.5 cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap"
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      </div>
                    </th>
                  ))}
                  <th className="text-caption uppercase text-text-muted tracking-wider px-4 py-3.5 text-right pr-6">
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedGoals.map((goal: any, i: number) => {
                  const isSelected = selectedIds.includes(goal.id);
                  const calcs = getGoalCalcs(goal);

                  return (
                    <motion.tr
                      key={goal.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={cn(
                        "border-b border-white/[0.04] hover:bg-surface-600/10 transition-all",
                        isSelected && "bg-brand-primary/[0.03]"
                      )}
                    >
                      {/* Checkbox cell */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSelectRow(goal.id)}
                          className={cn("hover:text-text-primary", isSelected ? "text-brand-primary" : "text-text-muted")}
                        >
                          {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                        </button>
                      </td>

                      {/* Goal details */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/goals/${goal.id}`} className="flex items-center gap-2 group">
                          <span className="text-base">{goalEmojis[goal.type] || "🎯"}</span>
                          <span className="text-sm font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
                            {goal.name}
                          </span>
                        </Link>
                      </td>

                      {/* Target Date */}
                      <td className="px-4 py-3 text-xs text-text-secondary font-mono-numbers whitespace-nowrap">
                        {new Date(goal.targetDate).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Today's Cost */}
                      <td className="px-4 py-3 text-xs text-text-primary font-mono-numbers whitespace-nowrap font-medium">
                        {formatCurrency(goal.targetAmountToday)}
                      </td>

                      {/* Future Value */}
                      <td className="px-4 py-3 text-xs text-text-primary font-mono-numbers whitespace-nowrap">
                        {formatCurrency(calcs.futureValue)}
                      </td>

                      {/* Current Corpus */}
                      <td className="px-4 py-3 text-xs text-text-secondary font-mono-numbers whitespace-nowrap">
                        {formatCurrency(goal.currentCorpus)}
                      </td>

                      {/* Required SIP */}
                      <td className="px-4 py-3 text-xs text-brand-primary font-mono-numbers whitespace-nowrap font-semibold">
                        {formatCurrency(calcs.requiredSIP)}
                      </td>

                      {/* Shortfall */}
                      <td className="px-4 py-3 text-xs font-mono-numbers whitespace-nowrap">
                        {calcs.fundingGap > 0 ? (
                          <span className="text-brand-accent font-semibold">{formatCurrency(calcs.fundingGap)}</span>
                        ) : (
                          <span className="text-brand-secondary font-semibold">₹0</span>
                        )}
                      </td>

                      {/* Risk */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          riskColors[goal.riskAppetite])}>
                          {goal.riskAppetite}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          statusColors[goal.status])}>
                          {statusLabels[goal.status]}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/goals/${goal.id}`}
                            className="p-1.5 rounded-lg hover:bg-surface-600/50 text-text-muted hover:text-brand-primary transition-all"
                            title="View Roadmap"
                          >
                            <ChevronRight className="h-4.5 w-4.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(goal.id, goal.name)}
                            className="p-1.5 rounded-lg hover:bg-brand-accent/10 text-text-muted hover:text-brand-accent transition-all"
                            title="Delete Goal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-surface-600/5">
          <p className="text-xs text-text-muted font-medium">
            Showing {paginatedGoals.length} of {filteredGoals.length} filtered goals
          </p>
          
          {totalPages > 1 && (
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-white/[0.06] bg-surface-700 hover:bg-surface-600 disabled:opacity-40 text-text-primary"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    currentPage === idx + 1
                      ? "bg-brand-primary text-white"
                      : "border border-white/[0.06] bg-surface-700 hover:bg-surface-600 text-text-secondary"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-white/[0.06] bg-surface-700 hover:bg-surface-600 disabled:opacity-40 text-text-primary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteTargetName}"? This will permanently wipe this goal calculation and forecast. This cannot be undone.`}
        isLoading={isDeletingSingle}
      />

      <ConfirmationDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Bulk Delete Goals"
        message={`Are you sure you want to delete ${selectedIds.length} selected goals? This will permanently delete all selected financial planning roadmap records. This cannot be undone.`}
        isLoading={isDeletingBulk}
      />
    </motion.div>
  );
}
