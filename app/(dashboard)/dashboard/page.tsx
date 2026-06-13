"use client";

import { motion } from "framer-motion";
import {
  Target,
  Wallet,
  TrendingUp,
  PiggyBank,
  Gauge,
  HeartPulse,
  Plus,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel";
import { SurplusWidget } from "@/components/dashboard/SurplusWidget";
import { SIPCalendar } from "@/components/dashboard/SIPCalendar";
import { calculateFinancialHealthScore } from "@/lib/financial-engine";
import Link from "next/link";
import dynamic from "next/dynamic";

const CorpusGrowthChart = dynamic(
  () => import("@/components/charts/CorpusGrowthChart").then((mod) => mod.CorpusGrowthChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-2xl bg-surface-800" /> }
);
const AllocationPieChart = dynamic(
  () => import("@/components/charts/AllocationPieChart").then((mod) => mod.AllocationPieChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-2xl bg-surface-800" /> }
);
import { useGoalStore } from "@/store/useGoalStore";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Skeleton } from "@/components/shared/Skeleton";
import EmptyDashboard from "@/components/dashboard/EmptyDashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fetcher = (url: string) => fetch(url).then(r => r.json()).then(r => r.data);

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: goals, isLoading, error } = useSWR("/api/goals", fetcher);
  const { data: profileData } = useSWR("/api/user/profile", fetcher);
  const setLocalGoals = useGoalStore((state) => state.setGoals);

  // Sync to local Zustand store for other pages
  useEffect(() => {
    if (goals) {
      setLocalGoals(goals);
    }
  }, [goals, setLocalGoals]);

  // Derived metrics
  const totalGoals = goals?.length ?? 0;
  const totalMonthlySIP = goals?.reduce((sum: number, g: any) => sum + (g.calculations?.requiredSIP ?? g.currentSIP ?? 0), 0) ?? 0;
  const totalFutureValue = goals?.reduce((sum: number, g: any) => sum + (g.calculations?.futureValue ?? g.targetAmountToday ?? 0), 0) ?? 0;
  const totalCorpus = goals?.reduce((sum: number, g: any) => sum + (g.currentCorpus ?? 0), 0) ?? 0;

  const avgSuccessProb = goals?.length
    ? Math.round(goals.reduce((sum: number, g: any) => sum + (g.calculations?.successProbability ?? 0), 0) / goals.length)
    : 0;

  const savingsRate = profileData?.profile?.savingsRate ?? 0;
  const hasEmergencyFund = profileData?.profile?.hasEmergencyFund ?? false;
  const financialHealthScore = calculateFinancialHealthScore(
    avgSuccessProb,
    savingsRate,
    hasEmergencyFund
  );

  // Skeletons during loading
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="metric" />
          ))}
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <Skeleton variant="chart" className="lg:col-span-3" />
          <Skeleton variant="card" className="lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!isLoading && totalGoals === 0) {
    return (
      <div className="flex-1 overflow-auto">
        <EmptyDashboard userName={session?.user?.name?.split(" ")[0] ?? "there"} />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 md:pb-0"
    >
      {/* Metric Cards Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <MetricCard
          title="Total Goals"
          value={totalGoals}
          icon={Target}
          change={totalGoals > 0 ? 15 : 0}
          trend={totalGoals > 0 ? "up" : "neutral"}
          chartData={totalGoals > 0 ? [1, 2, 2, 3, totalGoals] : [0]}
        />
        <MetricCard
          title="Net Worth"
          value={totalCorpus}
          prefix="₹"
          icon={Wallet}
          change={totalCorpus > 0 ? 12 : 0}
          trend={totalCorpus > 0 ? "up" : "neutral"}
          chartData={totalCorpus > 0 ? [80, 95, 102, 110, 125, 138, 145] : [0]}
        />
        <MetricCard
          title="Monthly SIP"
          value={totalMonthlySIP}
          prefix="₹"
          icon={PiggyBank}
          change={totalMonthlySIP > 0 ? 8 : 0}
          trend={totalMonthlySIP > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title="Projected Wealth"
          value={totalFutureValue}
          prefix="₹"
          icon={TrendingUp}
          change={totalFutureValue > 0 ? 5 : 0}
          trend={totalFutureValue > 0 ? "up" : "neutral"}
        />
        <MetricCard
          title="Success Rate"
          value={avgSuccessProb}
          suffix="%"
          icon={Gauge}
          trend={avgSuccessProb > 50 ? "up" : "neutral"}
          change={avgSuccessProb > 0 ? 3 : 0}
          chartData={avgSuccessProb > 0 ? [72, 75, 78, 79, 80, 81, avgSuccessProb] : [0]}
        />
        <MetricCard
          title="Health Score"
          value={financialHealthScore}
          suffix="/100"
          icon={HeartPulse}
          trend={financialHealthScore > 75 ? "up" : "neutral"}
          change={financialHealthScore > 50 ? 5 : 0}
          chartData={financialHealthScore > 0 ? [65, 68, 70, 72, 75, 76, financialHealthScore] : [0]}
        />
      </motion.div>

      {/* Row 1: Corpus Growth + AI Insights */}
      <motion.div
        variants={itemVariants}
        className="grid lg:grid-cols-5 gap-6"
      >
        <div className="lg:col-span-3">
          <ErrorBoundary fallbackTitle="Could not load Corpus Growth" fallbackDescription="We encountered an error loading your portfolio projections. Please try again.">
            <CorpusGrowthChart />
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-2">
          <ErrorBoundary fallbackTitle="Could not load AI Insights" fallbackDescription="We were unable to compile AI advisory insights at this time.">
            <AIInsightsPanel />
          </ErrorBoundary>
        </div>
      </motion.div>

      {/* Row 2: Goal Progress + Allocation Donut */}
      <motion.div
        variants={itemVariants}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Goal cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-jakarta font-semibold text-text-primary text-card-heading">
              Goal Progress
            </h3>
            <a
              href="/goals"
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              View All →
            </a>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {(goals || []).slice(0, 4).map((goal: any, i: number) => (
              <GoalCard key={goal.id} goal={goal} index={i} />
            ))}
          </div>
        </div>

        {/* Allocation chart */}
        <div>
          <ErrorBoundary fallbackTitle="Could not load Allocation Chart" fallbackDescription="Asset distribution visualizer failed to initialize.">
            <AllocationPieChart />
          </ErrorBoundary>
        </div>
      </motion.div>

      {/* Row 3: Upcoming Milestones + Activity */}
      <motion.div
        variants={itemVariants}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* Upcoming milestones */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-jakarta font-semibold text-text-primary text-card-heading mb-4">
            Upcoming Milestones
          </h3>
          <div className="space-y-3">
            {[
              {
                emoji: "🛡️",
                title: "Emergency Fund — 75% funded",
                date: "Aug 2025",
                status: "upcoming",
              },
              {
                emoji: "🏍️",
                title: "Dream Bike — Target reached",
                date: "Dec 2026",
                status: "on-track",
              },
              {
                emoji: "🌍",
                title: "Europe Trip — 50% milestone",
                date: "Mar 2027",
                status: "on-track",
              },
              {
                emoji: "🚗",
                title: "New Car — Review allocation",
                date: "Jun 2027",
                status: "at-risk",
              },
            ].map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-lg">{milestone.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {milestone.title}
                  </p>
                  <p className="text-xs text-text-muted">{milestone.date}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    milestone.status === "at-risk"
                      ? "bg-brand-gold/10 text-brand-gold"
                      : milestone.status === "upcoming"
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "bg-brand-secondary/10 text-brand-secondary"
                  }`}
                >
                  {milestone.status === "at-risk"
                    ? "At Risk"
                    : milestone.status === "upcoming"
                      ? "Soon"
                      : "On Track"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-jakarta font-semibold text-text-primary text-card-heading mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              {
                action: "SIP debited",
                detail: "₹8,250 for Europe Trip",
                time: "2 hours ago",
                icon: "💸",
              },
              {
                action: "Goal created",
                detail: "Wedding Fund added",
                time: "1 day ago",
                icon: "🎯",
              },
              {
                action: "AI insight applied",
                detail: "Switched Emergency Fund to Liquid Fund",
                time: "3 days ago",
                icon: "✨",
              },
              {
                action: "Portfolio rebalanced",
                detail: "Equity allocation increased to 55%",
                time: "1 week ago",
                icon: "⚖️",
              },
              {
                action: "Milestone reached",
                detail: "Emergency Fund hit 50%",
                time: "2 weeks ago",
                icon: "🏆",
              },
            ].map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {activity.action}
                  </p>
                  <p className="text-xs text-text-muted">{activity.detail}</p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Row 4: Surplus Widget & SIP Schedule */}
      <motion.div
        variants={itemVariants}
        className="grid lg:grid-cols-2 gap-6"
      >
        <ErrorBoundary fallbackTitle="Could not load Investable Surplus" fallbackDescription="We were unable to render the surplus calculator.">
          <SurplusWidget totalMonthlySIP={totalMonthlySIP} />
        </ErrorBoundary>

        <ErrorBoundary fallbackTitle="Could not load SIP Schedule" fallbackDescription="We were unable to load the SIP schedule calendar.">
          <SIPCalendar goals={goals || []} />
        </ErrorBoundary>
      </motion.div>

      {/* Quick-Add Goal Floating Action Button (FAB) */}
      <Link
        href="/goals/new"
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-glow hover:scale-110 active:scale-95 transition-all hover:bg-brand-primary/95 group"
        aria-label="Add new goal"
      >
        <Plus className="h-6 w-6 transition-transform group-hover:rotate-90 duration-300" />
      </Link>
    </motion.div>
  );
}
