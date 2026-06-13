"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Plus, Play, Sparkles, X } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface EmptyDashboardProps {
  userName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const suggestions = [
  { label: "Europe Trip", emoji: "🌍", type: "TRAVEL" },
  { label: "Buy a House", emoji: "🏠", type: "HOUSE" },
  { label: "Buy a Car", emoji: "🚗", type: "CAR" },
  { label: "Higher Education", emoji: "🎓", type: "EDUCATION" },
  { label: "Wedding", emoji: "💍", type: "WEDDING" },
  { label: "Retirement", emoji: "👴", type: "RETIREMENT" },
  { label: "Emergency Fund", emoji: "🛡️", type: "EMERGENCY" },
  { label: "Start a Business", emoji: "🚀", type: "BUSINESS" },
];

export default function EmptyDashboard({ userName }: EmptyDashboardProps) {
  const router = useRouter();
  const greeting = getGreeting();
  const shouldReduceMotion = useReducedMotion();
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Floating animations - disable if prefers-reduced-motion is active
  const floatAnimation = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          y: [0, -8, 0],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          },
        };

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-4rem)] bg-surface-900/10">
      <div className="w-full max-w-[580px] text-center space-y-8 my-auto">
        
        {/* Floating Animation Cards Section */}
        <div className="relative h-48 w-full max-w-[420px] mx-auto mb-4 flex items-center justify-center">
          {/* Card 1: Europe Trip (Top-Left) */}
          <motion.div
            animate={floatAnimation(0)}
            className="absolute top-2 left-0 z-20 w-[210px] glass-card p-3 rounded-2xl text-left border border-white/[0.05] shadow-lg backdrop-blur-md bg-surface-800/60"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">🌍</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">Europe Trip</p>
                <p className="text-[10px] text-text-muted">₹4.2L · Dec 2027</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-white/[0.04]">
              <span className="text-[10px] text-text-secondary">Req. SIP</span>
              <span className="text-xs font-bold text-brand-secondary">₹8,250/mo</span>
            </div>
          </motion.div>

          {/* Card 2: AI Planner (Center) */}
          <motion.div
            animate={floatAnimation(1)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[240px] glass-elevated p-4 rounded-2xl text-left border border-brand-primary/20 shadow-glow shadow-brand-primary/10 backdrop-blur-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-violet">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">AI Optimizer</span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-text-secondary leading-tight">AI is calculating your plan...</p>
              <div className="h-2 w-full rounded bg-surface-600/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary w-2/3 h-full rounded animate-pulse" />
              </div>
              <div className="h-1.5 w-5/6 rounded bg-surface-600/30" />
            </div>
          </motion.div>

          {/* Card 3: Success Probability (Bottom-Right) */}
          <motion.div
            animate={floatAnimation(2)}
            className="absolute bottom-2 right-0 z-20 w-[190px] glass-card p-3 rounded-2xl text-left border border-white/[0.05] shadow-lg backdrop-blur-md bg-surface-800/60"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider">Analysis</span>
              <span className="text-[10px] text-text-muted">Probability</span>
            </div>
            <div className="text-base font-bold text-text-primary mb-2 flex items-baseline gap-0.5">
              82% <span className="text-[10px] font-medium text-text-secondary">Success</span>
            </div>
            <div className="flex items-end gap-1.5 h-6">
              <div className="w-full bg-brand-primary/20 h-[30%] rounded-t-sm" />
              <div className="w-full bg-brand-primary/50 h-[60%] rounded-t-sm" />
              <div className="w-full bg-brand-primary h-[90%] rounded-t-sm" />
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {greeting}, {userName} 👋
          </h1>
          <h2 className="font-jakarta text-lg sm:text-xl font-bold text-text-secondary">
            What&apos;s your first financial dream?
          </h2>
          <p className="text-sm text-text-muted max-w-[460px] mx-auto leading-relaxed">
            Add your first goal and GoalWise AI will calculate exactly how much to invest, and in what, to make it happen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/goals/new")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl gradient-cta text-white font-semibold flex items-center justify-center gap-2 hover:shadow-glow transition-shadow text-sm"
          >
            <Plus className="h-4.5 w-4.5" /> Add My First Goal
          </motion.button>
          
          <button
            onClick={() => setShowVideoModal(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/[0.08] text-text-primary font-medium flex items-center justify-center gap-2 hover:bg-surface-600/30 transition-colors text-sm"
          >
            <Play className="h-4 w-4 text-brand-primary" /> Watch How It Works →
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="space-y-4 pt-4">
          <p className="text-xs uppercase font-bold text-text-muted tracking-widest">
            Popular goals to get you started:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestions.map((chip) => (
              <motion.button
                key={chip.label}
                whileHover={{ scale: 1.02, borderColor: "rgba(108, 99, 255, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  router.push(`/goals/new?type=${chip.type}&name=${encodeURIComponent(chip.label)}`)
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/[0.06] bg-surface-800/40 hover:bg-surface-800/80 text-xs text-text-secondary hover:text-text-primary transition-all duration-200"
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

      </div>

      {/* Video Modal (Popup Dialog) */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl aspect-video rounded-3xl overflow-hidden bg-surface-900 border border-white/[0.08] z-10 shadow-2xl"
            >
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 z-25 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                aria-label="Close video"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              
              {/* Embed YouTube / Video Walkthrough or beautiful placeholder */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="GoalWise AI Walkthrough Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
