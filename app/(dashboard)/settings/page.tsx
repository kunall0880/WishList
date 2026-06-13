"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { User, Bell, Shield, LogOut, Crown, CreditCard, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { useGoalStore } from "@/store/useGoalStore";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const goals = useGoalStore((s) => s.goals);
  const clearGoals = useGoalStore((s) => s.setGoals);

  // Profile fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Sync profile details if auth context changes
  useEffect(() => {
    if (user) {
      setName(user.name || user.email?.split("@")[0] || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error(data.error || "Failed to save profile");
      }
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Export All Data (JSON)
  const handleExportData = () => {
    const dataBackup = {
      profile: { name, email, phone },
      exportedAt: new Date().toISOString(),
      goalsCount: goals.length,
      goalsList: goals,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataBackup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wishlist_profile_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("All investor profile data backed up successfully!");
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    clearGoals([]);
    toast.success("Account records cleared. Logging out...");
    setIsDeleteConfirmOpen(false);
    setTimeout(() => {
      logout();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0"
    >
      <h1 className="font-jakarta text-2xl font-bold text-text-primary">Settings</h1>

      {/* Profile Card */}
      <GlassCard padding="lg">
        <h3 className="font-jakarta font-semibold text-text-primary text-base mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-primary" /> Profile Settings
        </h3>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-xl font-bold">
            {name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{name}</p>
            <p className="text-sm text-text-muted">{email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Crown className="h-3.5 w-3.5 text-brand-gold" />
              <span className="text-xs text-brand-gold font-semibold">Pro Plan Active</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
            />
          </div>
          <div>
            <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
            />
          </div>
          <div>
            <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isSavingProfile}
            className="gradient-cta text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:shadow-glow transition-all disabled:opacity-50"
          >
            {isSavingProfile ? "Saving..." : "Save Profile Details"}
          </button>
        </form>
      </GlassCard>

      {/* Plan & Billing Card (Static Pro Plan Active) */}
      <GlassCard padding="lg">
        <h3 className="font-jakarta font-semibold text-text-primary text-base mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-primary" /> Plan & Billing
        </h3>
        <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/15 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-brand-gold" />
              <span className="text-sm font-bold text-text-primary">Wishlist Pro Membership</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Unlimited goal tracking, premium Monte Carlo simulators, and gpt-4o-mini AI advisory insights.
            </p>
          </div>
          <div className="text-right flex-shrink-0 self-start sm:self-auto">
            <span className="text-xs text-brand-secondary font-bold bg-brand-secondary/10 px-2.5 py-1 rounded-full uppercase">
              Active • ₹99/mo
            </span>
            <p className="text-[10px] text-text-muted mt-1.5">Renews on July 11, 2026</p>
          </div>
        </div>
      </GlassCard>

      {/* Appearance Card */}
      <GlassCard padding="lg">
        <h3 className="font-jakarta font-semibold text-text-primary text-base mb-4">Appearance Settings</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Dark Theme Mode</p>
            <p className="text-xs text-text-muted mt-0.5">Toggle default system styling preferences</p>
          </div>
          <ThemeToggle />
        </div>
      </GlassCard>

      {/* Notifications Card */}
      <GlassCard padding="lg">
        <h3 className="font-jakarta font-semibold text-text-primary text-base mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-primary" /> Notification Rules
        </h3>
        {[
          { label: "SIP Debit Alerts", desc: "Notify me 3 days prior to monthly SIP debit dates", enabled: true },
          { label: "Timeline Milestones", desc: "Congratulate me when a goal crosses 25%, 50%, 75% marks", enabled: true },
          { label: "AI Rebalancing Warnings", desc: "Notify when market changes trigger asset reallocations", enabled: true },
          { label: "Weekly Advisory Digest", desc: "Send consolidated goal roadmap reviews weekly", enabled: false },
        ].map((n) => (
          <div key={n.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
            <div>
              <p className="text-sm font-semibold text-text-primary">{n.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{n.desc}</p>
            </div>
            <div className={cn("h-6 w-11 rounded-full transition-colors relative cursor-pointer",
              n.enabled ? "bg-brand-primary" : "bg-surface-600")}>
              <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow",
                n.enabled ? "translate-x-5" : "translate-x-0.5")} />
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Danger Zone Card */}
      <GlassCard padding="lg" className="border-brand-accent/20 bg-brand-accent/[0.01]">
        <h3 className="font-jakarta font-semibold text-brand-accent text-base mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" /> Danger Zone Settings
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 py-3 border-b border-white/[0.04]">
            <div>
              <p className="text-sm font-semibold text-text-primary">Backup & Export All Data</p>
              <p className="text-xs text-text-muted mt-0.5">Download a JSON database containing all goals details</p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary border border-white/[0.08] hover:bg-surface-600/30 px-4 py-2 rounded-xl transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Export Data
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Permanently Delete Account</p>
              <p className="text-xs text-text-muted mt-0.5">Wipes all active dashboards, custom calculations, and storage</p>
            </div>
            <button
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="text-xs font-bold text-brand-accent border border-brand-accent/20 px-4 py-2 rounded-xl hover:bg-brand-accent/10 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Sign Out Button */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-text-muted hover:text-brand-accent transition-colors py-4 border border-white/[0.04] rounded-2xl bg-surface-600/5 hover:bg-brand-accent/5"
      >
        <LogOut className="h-4 w-4" /> Log Out Session
      </button>

      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account"
        message="WARNING: Are you sure you want to permanently delete your account? This will wipe all goal roadmaps, AI calculations, and settings records. This action cannot be undone."
      />
    </motion.div>
  );
}
