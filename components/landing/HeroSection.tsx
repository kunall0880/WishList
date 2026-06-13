"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  PiggyBank,
  Target,
  Wallet,
  ChevronRight,
  Play,
  Users,
  BarChart3,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import toast from "react-hot-toast";

/* ── Animation Variants ────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const floatingCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.8 + i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

/* ── Floating Finance Icons ────────────────────────── */

const floatingIcons = [
  { Icon: TrendingUp, x: "10%", y: "20%", delay: 0, duration: 7 },
  { Icon: PiggyBank, x: "85%", y: "15%", delay: 1, duration: 8 },
  { Icon: Target, x: "75%", y: "70%", delay: 2, duration: 6 },
  { Icon: Wallet, x: "15%", y: "75%", delay: 0.5, duration: 9 },
  { Icon: BarChart3, x: "50%", y: "10%", delay: 1.5, duration: 7.5 },
];

export function HeroSection() {
  const handleGetPlan = () => {
    toast("Sign up to get your personalized investment plan! 🚀", {
      icon: "✨",
      style: {
        background: "rgb(var(--color-surface-700))",
        color: "rgb(var(--color-text-primary))",
        border: "1px solid rgba(108, 99, 255, 0.3)",
      },
    });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* ── Background Blobs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Violet blob — top left */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full animate-float-1"
          style={{
            background:
              "radial-gradient(circle, rgba(108, 99, 255, 0.15) 0%, transparent 70%)",
          }}
        />
        {/* Mint blob — bottom right */}
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full animate-float-2"
          style={{
            background:
              "radial-gradient(circle, rgba(6, 214, 160, 0.12) 0%, transparent 70%)",
          }}
        />
        {/* Coral blob — top right */}
        <div
          className="absolute -top-20 right-1/4 w-[400px] h-[400px] rounded-full animate-float-3"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)",
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-[0.4]" />

        {/* Floating finance icons */}
        {floatingIcons.map(({ Icon, x, y, delay, duration }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: y }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          >
            <Icon className="h-8 w-8 text-brand-primary/20" />
          </motion.div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left Column: Text ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 px-4 py-1.5 text-caption uppercase text-brand-primary font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse-ring" />
                AI-Powered Financial Planning
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="mt-6 font-jakarta text-hero leading-[1.1] tracking-[-2px] text-text-primary"
            >
              Turn your{" "}
              <span className="gradient-text">dreams</span>
              <br className="hidden sm:block" /> into an
              <br className="hidden sm:block" /> investment plan.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-text-secondary max-w-[480px] mx-auto lg:mx-0 leading-relaxed"
            >
              Tell us your goal. We&apos;ll calculate the exact SIP, timeline,
              and investment strategy to get you there.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <a
                href="#cta"
                className="gradient-cta text-white font-semibold px-8 py-4 rounded-xl text-base hover:shadow-glow transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Plan My First Goal
                <ChevronRight className="h-4 w-4" />
              </a>
              <button className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors px-4 py-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 group-hover:border-brand-primary/40 transition-colors">
                  <Play className="h-4 w-4 ml-0.5" />
                </div>
                <span className="font-medium">Watch Demo</span>
              </button>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex items-center gap-6 text-sm text-text-muted justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-primary/60" />
                <span>
                  Trusted by{" "}
                  <span className="text-text-secondary font-medium font-mono-numbers">
                    50,000+
                  </span>{" "}
                  investors
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-secondary/60" />
                <span>
                  <span className="text-text-secondary font-medium font-mono-numbers">
                    ₹2.4Cr+
                  </span>{" "}
                  goals tracked
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Column: Interactive Card ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative flex justify-center lg:justify-end"
          >
            {/* Sample result cards — floating behind main card */}
            <motion.div
              custom={0}
              variants={floatingCardVariants}
              className="absolute -top-4 -left-4 lg:top-4 lg:-left-8 z-0"
            >
              <GlassCard padding="sm" className="w-56">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-lg">
                    🌍
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Europe Trip
                    </p>
                    <p className="text-xs text-text-muted font-mono-numbers">
                      ₹4.2L · ₹8,250/mo
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              custom={1}
              variants={floatingCardVariants}
              className="absolute -bottom-4 -right-4 lg:bottom-8 lg:-right-4 z-0"
            >
              <GlassCard padding="sm" className="w-52">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0">
                    <CircularProgressbar
                      value={82}
                      text="82%"
                      styles={buildStyles({
                        textSize: "28px",
                        pathColor: "#06D6A0",
                        textColor: "rgb(var(--color-text-primary))",
                        trailColor: "rgba(108, 99, 255, 0.1)",
                      })}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Success Rate
                    </p>
                    <p className="text-xs text-text-muted">High confidence</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* ── Main Quick Plan Card ── */}
            <motion.div variants={cardVariants} className="relative z-10 w-full max-w-md">
              <GlassCard padding="lg" elevated className="relative">
                {/* Card header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
                    <Target className="h-4 w-4 text-brand-primary" />
                  </div>
                  <h3 className="font-jakarta font-bold text-text-primary">
                    Quick Plan
                  </h3>
                  <span className="ml-auto text-caption uppercase text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full font-semibold">
                    Free
                  </span>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  {/* Goal type */}
                  <div>
                    <label className="text-caption uppercase text-text-muted mb-1.5 block tracking-wide">
                      Goal Type
                    </label>
                    <select
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors appearance-none cursor-pointer"
                      defaultValue="travel"
                    >
                      <option value="travel">🌍 Europe Trip</option>
                      <option value="house">🏠 Buy a House</option>
                      <option value="car">🚗 Buy a Car</option>
                      <option value="education">🎓 Education</option>
                      <option value="wedding">💍 Wedding</option>
                      <option value="retirement">👴 Retirement</option>
                    </select>
                  </div>

                  {/* Target amount */}
                  <div>
                    <label className="text-caption uppercase text-text-muted mb-1.5 block tracking-wide">
                      Target Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-muted font-mono-numbers">
                        ₹
                      </span>
                      <input
                        type="text"
                        defaultValue="4,20,000"
                        className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-8 pr-4 py-3 text-sm text-text-primary font-mono-numbers focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Target date */}
                  <div>
                    <label className="text-caption uppercase text-text-muted mb-1.5 block tracking-wide">
                      Target Date
                    </label>
                    <input
                      type="month"
                      defaultValue="2027-12"
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] px-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors"
                    />
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGetPlan}
                    className="w-full gradient-cta text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 hover:shadow-glow transition-shadow duration-300"
                  >
                    Get My Plan
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Results preview */}
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-caption uppercase text-text-muted tracking-wide">
                        Monthly SIP
                      </p>
                      <p className="text-xl font-bold text-brand-primary font-mono-numbers mt-1">
                        <AnimatedCounter value={8250} prefix="₹" />
                      </p>
                    </div>
                    <div>
                      <p className="text-caption uppercase text-text-muted tracking-wide">
                        Duration
                      </p>
                      <p className="text-xl font-bold text-brand-secondary font-mono-numbers mt-1">
                        2.5 yrs
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
