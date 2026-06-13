"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { Coins, PiggyBank, ArrowDownRight, Sparkles, Plus } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(r => r.json()).then(r => r.data);

interface SurplusWidgetProps {
  totalMonthlySIP: number;
}

export function SurplusWidget({ totalMonthlySIP }: SurplusWidgetProps) {
  const { data: profileData, isLoading } = useSWR("/api/user/profile", fetcher);

  if (isLoading) {
    return (
      <div className="h-[200px] w-full animate-pulse rounded-3xl bg-surface-800/50" />
    );
  }

  const profile = profileData?.profile || {
    monthlySalary: 0,
    monthlyExpenses: 0,
  };

  const salary = profile.monthlySalary || 0;
  const expenses = profile.monthlyExpenses || 0;
  const surplus = Math.max(0, salary - expenses - totalMonthlySIP);

  // Percentages for breakdown
  const totalOutflow = expenses + totalMonthlySIP;
  const expensePercentage = salary > 0 ? Math.round((expenses / salary) * 100) : 0;
  const sipPercentage = salary > 0 ? Math.round((totalMonthlySIP / salary) * 100) : 0;
  const surplusPercentage = salary > 0 ? Math.round((surplus / salary) * 100) : 0;

  const hasSalary = salary > 0;

  return (
    <GlassCard padding="lg" className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-jakarta font-semibold text-text-primary text-card-heading flex items-center gap-1.5">
            <Coins className="h-5 w-5 text-brand-primary" /> Investable Surplus
          </h3>
          <span className="text-[10px] font-bold text-text-muted bg-surface-600/50 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Monthly Flow
          </span>
        </div>

        {hasSalary ? (
          <div className="space-y-4">
            {/* Surplus Big Value */}
            <div>
              <p className="text-[10px] uppercase text-text-muted tracking-wider">Remaining Investable Surplus</p>
              <p className="text-2xl font-bold font-jakarta text-text-primary mt-1">
                ₹{surplus.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-text-muted">/mo</span>
              </p>
            </div>

            {/* Visual Progress Bar Breakdown */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-surface-600/40 rounded-full flex overflow-hidden">
                <div 
                  className="bg-brand-accent transition-all" 
                  style={{ width: `${expensePercentage}%` }} 
                  title={`Expenses: ${expensePercentage}%`}
                />
                <div 
                  className="bg-brand-primary transition-all" 
                  style={{ width: `${sipPercentage}%` }} 
                  title={`SIP Commitments: ${sipPercentage}%`}
                />
                <div 
                  className="bg-brand-secondary transition-all" 
                  style={{ width: `${surplusPercentage}%` }} 
                  title={`Remaining Surplus: ${surplusPercentage}%`}
                />
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-text-secondary">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand-accent" />
                  <span className="truncate">Expenses ({expensePercentage}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand-primary" />
                  <span className="truncate">SIPs ({sipPercentage}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand-secondary" />
                  <span className="truncate">Surplus ({surplusPercentage}%)</span>
                </div>
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="space-y-2.5 p-3 rounded-2xl bg-surface-600/20 border border-white/[0.02] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Monthly Income</span>
                <span className="font-semibold text-text-primary">+ ₹{salary.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Expenses</span>
                <span className="font-semibold text-brand-accent">- ₹{expenses.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Active Goals SIP</span>
                <span className="font-semibold text-brand-primary">- ₹{totalMonthlySIP.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Configure Your Profile</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[200px] mx-auto">
                Set up your monthly salary and expenses to track your real-time investable surplus.
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors pt-1"
            >
              <Plus className="h-3.5 w-3.5" /> Set Financial Stats
            </Link>
          </div>
        )}
      </div>

      {hasSalary && surplus > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-[10px] text-emerald-400 font-medium">You have surplus cash available!</p>
          <Link
            href="/goals/new"
            className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-0.5"
          >
            Create New Goal <Plus className="h-3 w-3" />
          </Link>
        </div>
      )}
    </GlassCard>
  );
}
