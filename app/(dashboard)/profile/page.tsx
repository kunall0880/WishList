"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/lib/auth-provider";
import { 
  User, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Target, 
  Activity,
  ChevronRight,
  Flame,
  Check,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface UserProfileData {
  age: number | null;
  monthlySalary: number;
  monthlyExpenses: number;
  currentInvestments: number;
  riskComfort: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";
  hasEmergencyFund: boolean;
  investmentStyle: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Profile forms and data state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileData, setProfileData] = useState<UserProfileData>({
    age: null,
    monthlySalary: 0,
    monthlyExpenses: 0,
    currentInvestments: 0,
    riskComfort: "BALANCED",
    hasEmergencyFund: false,
    investmentStyle: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch profile details
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/user/profile");
        const json = await response.json();
        if (json.success) {
          const u = json.data;
          setName(u.name || "");
          setEmail(u.email || "");
          if (u.profile) {
            setProfileData({
              age: u.profile.age || null,
              monthlySalary: u.profile.monthlySalary || 0,
              monthlyExpenses: u.profile.monthlyExpenses || 0,
              currentInvestments: u.profile.currentInvestments || 0,
              riskComfort: u.profile.riskComfort || "BALANCED",
              hasEmergencyFund: u.profile.hasEmergencyFund || false,
              investmentStyle: u.profile.investmentStyle || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
        toast.error("Failed to load profile details");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          ...profileData,
          age: profileData.age ? Number(profileData.age) : null,
        }),
      });

      const json = await response.json();
      if (json.success) {
        toast.success("Investor Profile updated successfully!");
        if (json.data.profile) {
          setProfileData({
            age: json.data.profile.age || null,
            monthlySalary: json.data.profile.monthlySalary || 0,
            monthlyExpenses: json.data.profile.monthlyExpenses || 0,
            currentInvestments: json.data.profile.currentInvestments || 0,
            riskComfort: json.data.profile.riskComfort || "BALANCED",
            hasEmergencyFund: json.data.profile.hasEmergencyFund || false,
            investmentStyle: json.data.profile.investmentStyle || "",
          });
        }
      } else {
        toast.error(json.error || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Derived financial computations
  const monthlySalary = profileData.monthlySalary || 0;
  const monthlyExpenses = profileData.monthlyExpenses || 0;
  const savingsAmount = Math.max(0, monthlySalary - monthlyExpenses);
  const savingsRate = monthlySalary > 0 ? Math.round((savingsAmount / monthlySalary) * 100) : 0;

  // AI Insights Engine (Client-Side dynamic financial cards)
  const generateInsights = () => {
    const insights = [];

    // 1. Savings Rate Advice
    if (savingsRate < 20) {
      insights.push({
        title: "Boost Your Savings Rate",
        type: "warning",
        desc: `Your current savings rate is ${savingsRate}%. Financial experts recommend saving at least 20% of your income. Consider reviewing monthly subscriptions or discretionary expenses.`,
        metric: `Shortfall of ${20 - savingsRate}%`,
        icon: <Flame className="h-5 w-5 text-brand-accent animate-pulse" />
      });
    } else if (savingsRate >= 40) {
      insights.push({
        title: "Super Saver Status!",
        type: "success",
        desc: `Incredible job! You are saving ${savingsRate}% of your salary (₹${savingsAmount.toLocaleString()}/mo). Your wealth accumulation phase is optimized for compounding.`,
        metric: `${savingsRate}% savings rate`,
        icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />
      });
    } else {
      insights.push({
        title: "Healthy Savings Flow",
        type: "info",
        desc: `You save ${savingsRate}% of your income. Moving this closer to 35% can significantly reduce your time-to-retirement goals.`,
        metric: `₹${savingsAmount.toLocaleString()}/mo saved`,
        icon: <Coins className="h-5 w-5 text-brand-primary" />
      });
    }

    // 2. Emergency Fund Checklist
    if (!profileData.hasEmergencyFund) {
      const targetFund = monthlyExpenses * 6;
      insights.push({
        title: "Build Emergency Reserve First",
        type: "danger",
        desc: `You indicated you do not have an active emergency fund. Prioritize building a 6-month buffer of ₹${targetFund.toLocaleString()} in a high-yield liquid account before locking corpus in long-term goals.`,
        metric: `Target: ₹${targetFund.toLocaleString()}`,
        icon: <AlertCircle className="h-5 w-5 text-brand-accent" />
      });
    } else {
      insights.push({
        title: "Emergency Shield Active",
        type: "success",
        desc: "Having a contingency fund safeguards your long-term goal portfolios. You won't be forced to liquidate equity goals during volatile market cycles.",
        metric: "6 months safe",
        icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />
      });
    }

    // 3. Risk & Asset Allocation
    if (profileData.age && profileData.age < 35 && profileData.riskComfort === "CONSERVATIVE") {
      insights.push({
        title: "Conservative Stance Opportunity",
        type: "info",
        desc: `At age ${profileData.age}, you have a long time horizon. A purely conservative stance might drag down long-term purchasing power against inflation. Consider allocating 15-20% to low-cost index funds.`,
        metric: "Inflation drag risk",
        icon: <TrendingUp className="h-5 w-5 text-amber-500" />
      });
    } else if (profileData.riskComfort === "AGGRESSIVE") {
      insights.push({
        title: "Aggressive Growth Strategy",
        type: "info",
        desc: "Your comfort level matches volatile asset classes. Keep rebalancing annually to lock in gains and prevent specific stocks or sectors from over-weighting your portfolio.",
        metric: "High equity bias",
        icon: <Sparkles className="h-5 w-5 text-brand-secondary" />
      });
    } else {
      insights.push({
        title: "Balanced Asset Allocation",
        type: "success",
        desc: "A balanced profile typical of 60/40 or 50/50 splits offers excellent downside protection while participating in equity upsides. Best suited for medium-term goals (3-7 years).",
        metric: "Medium volatility",
        icon: <Target className="h-5 w-5 text-blue-400" />
      });
    }

    return insights;
  };

  const insightsList = generateInsights();

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      <div>
        <h1 className="font-jakarta text-2xl font-bold text-text-primary">Financial Profile</h1>
        <p className="text-xs text-text-muted mt-1">Configure your personal and investment parameters to fine-tune AI recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column — Summary & Stats */}
        <div className="lg:col-span-3 space-y-6">
          <GlassCard padding="lg" className="text-center flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-2xl font-bold shadow-md shadow-brand-primary/10">
              {name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"}
            </div>
            <h3 className="font-jakarta font-semibold text-text-primary text-base mt-4">{name || "Investor Profile"}</h3>
            <p className="text-xs text-text-muted truncate w-full max-w-[180px]">{email}</p>
            
            <div className="mt-2.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {user?.plan || "FREE"} Tier
            </div>

            <div className="w-full border-t border-white/[0.04] my-5" />

            <div className="w-full space-y-4 text-left">
              <div>
                <p className="text-[10px] uppercase text-text-muted tracking-wider">Savings Rate</p>
                <div className="flex items-end justify-between mt-1">
                  <span className="text-lg font-bold font-jakarta text-text-primary">{savingsRate}%</span>
                  <span className="text-xs text-brand-secondary">{savingsRate >= 40 ? "Excellent" : savingsRate >= 20 ? "Good" : "Low"}</span>
                </div>
                <div className="w-full bg-surface-600/50 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div 
                    className="bg-brand-primary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, savingsRate)}%` }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 bg-surface-600/30 rounded-xl border border-white/[0.02]">
                  <p className="text-[10px] text-text-muted uppercase">Salary</p>
                  <p className="text-xs font-bold text-text-primary mt-1 truncate">₹{(monthlySalary/1000).toFixed(0)}k/mo</p>
                </div>
                <div className="p-3 bg-surface-600/30 rounded-xl border border-white/[0.02]">
                  <p className="text-[10px] text-text-muted uppercase">Risk Profile</p>
                  <p className="text-xs font-bold text-brand-primary mt-1 truncate capitalize">{profileData.riskComfort.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard padding="md" className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-brand-secondary" /> Setup Progress
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { label: "Basic Information", checked: !!name && !!email },
                { label: "Financial Data", checked: monthlySalary > 0 },
                { label: "Risk Preferences", checked: !!profileData.riskComfort },
                { label: "Emergency Buffer", checked: profileData.hasEmergencyFund },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between text-text-secondary">
                  <span>{step.label}</span>
                  {step.checked ? (
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-surface-600" />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Center Column — The Details Form */}
        <div className="lg:col-span-5">
          <GlassCard padding="lg">
            <h3 className="font-jakarta font-semibold text-text-primary text-base mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-brand-primary" /> Investor Settings
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Name & Email (Synchronized) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                  />
                </div>
              </div>

              {/* Age & Income */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Enter age (e.g. 28)"
                    value={profileData.age || ""}
                    onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Monthly Income (Salary)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-text-muted text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Salary in INR"
                      value={profileData.monthlySalary || ""}
                      onChange={(e) => setProfileData(prev => ({ ...prev, monthlySalary: Number(e.target.value) }))}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-8 pr-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Expenses & Investments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Monthly Expenses</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-text-muted text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Expenses in INR"
                      value={profileData.monthlyExpenses || ""}
                      onChange={(e) => setProfileData(prev => ({ ...prev, monthlyExpenses: Number(e.target.value) }))}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-8 pr-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Total Current Investments</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-text-muted text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Existing savings/equity"
                      value={profileData.currentInvestments || ""}
                      onChange={(e) => setProfileData(prev => ({ ...prev, currentInvestments: Number(e.target.value) }))}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-8 pr-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Risk appetite & investment style */}
              <div>
                <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Investment Risk Profile</label>
                <select
                  value={profileData.riskComfort}
                  onChange={(e) => setProfileData(prev => ({ ...prev, riskComfort: e.target.value as any }))}
                  className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors [&>option]:bg-surface-800"
                >
                  <option value="CONSERVATIVE">Conservative (Low volatility, Fixed Income / Debt)</option>
                  <option value="BALANCED">Balanced (Moderate volatility, 60/40 Equity/Debt)</option>
                  <option value="AGGRESSIVE">Aggressive (High volatility, Equity / Sectoral Index)</option>
                </select>
              </div>

              <div>
                <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Preferred Asset Classes</label>
                <input
                  type="text"
                  placeholder="e.g. Mutual Funds, Direct Equity, Gold"
                  value={profileData.investmentStyle}
                  onChange={(e) => setProfileData(prev => ({ ...prev, investmentStyle: e.target.value }))}
                  className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                />
              </div>

              {/* Emergency Fund Switch */}
              <div className="flex items-center justify-between p-4 bg-surface-600/20 border border-white/[0.04] rounded-2xl">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">6-Month Emergency Buffer</h4>
                  <p className="text-xs text-text-muted mt-0.5">Do you have a dedicated contingency fund built?</p>
                </div>
                <div 
                  onClick={() => setProfileData(prev => ({ ...prev, hasEmergencyFund: !prev.hasEmergencyFund }))}
                  className={`h-6 w-11 rounded-full transition-colors relative cursor-pointer ${
                    profileData.hasEmergencyFund ? "bg-brand-primary" : "bg-surface-600"
                  }`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${
                    profileData.hasEmergencyFund ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="gradient-cta w-full text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Save Financial Profile
                    </>
                  )}
                </button>
              </div>

            </form>
          </GlassCard>
        </div>

        {/* Right Column — AI Financial Advisory Insights */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard padding="lg" className="border-brand-primary/10">
            <h3 className="font-jakarta font-semibold text-text-primary text-base mb-1.5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-primary animate-pulse" /> Advisor Insights
            </h3>
            <p className="text-xs text-text-muted mb-4">Rule-based wealth recommendations derived from your live metrics.</p>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {insightsList.map((ins, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-surface-600/30 border border-white/[0.04] hover:border-brand-primary/20 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {ins.icon}
                        <h4 className="text-sm font-semibold text-text-primary leading-tight">{ins.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {ins.metric}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{ins.desc}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-brand-primary/[0.03] border border-brand-primary/10 text-center">
              <p className="text-[10px] text-text-muted leading-relaxed">
                These advice cards are computed dynamically. Updates on inputs are evaluated in real time.
              </p>
            </div>
          </GlassCard>
        </div>

      </div>
    </motion.div>
  );
}
