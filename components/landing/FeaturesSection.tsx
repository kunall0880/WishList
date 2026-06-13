"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  LineChart,
  TrendingUp,
  PiggyBank,
  Target,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Financial Planner",
    description:
      "Get personalized investment strategies powered by GPT-4 and real-time market data.",
    gradient: "from-[#6C63FF] to-[#9B8FFF]",
  },
  {
    icon: LineChart,
    title: "Goal Timeline Tracker",
    description:
      "Visualize every milestone on your journey to financial freedom with interactive charts.",
    gradient: "from-[#06D6A0] to-[#34D399]",
  },
  {
    icon: TrendingUp,
    title: "Inflation Calculator",
    description:
      "See the real future cost of your goals with dynamic inflation modeling and projections.",
    gradient: "from-[#FF6B6B] to-[#FF8787]",
  },
  {
    icon: PiggyBank,
    title: "SIP Optimizer",
    description:
      "Find the perfect monthly investment amount for any goal with AI-driven optimization.",
    gradient: "from-[#FFD166] to-[#FBBF24]",
  },
  {
    icon: Target,
    title: "Risk Profiler",
    description:
      "Understand your risk appetite with our smart assessment quiz and tailored advice.",
    gradient: "from-[#6C63FF] to-[#06D6A0]",
  },
  {
    icon: RefreshCw,
    title: "Portfolio Rebalancer",
    description:
      "Keep your investments aligned as markets move with automated rebalancing signals.",
    gradient: "from-[#9B8FFF] to-[#6C63FF]",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-24 lg:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="text-caption uppercase text-brand-primary tracking-widest">
            Features
          </span>
          <h2 className="mt-3 font-jakarta text-section text-text-primary">
            Everything you need to plan
            <br className="hidden sm:block" /> your financial future
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Powerful tools designed for Indian investors who want clarity,
            confidence, and control over their wealth.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <GlassCard
                hover
                glow
                padding="lg"
                className="h-full group transition-all duration-300 hover:border-brand-primary/20"
              >
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-5`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                {/* Text */}
                <h3 className="font-jakarta text-card-heading text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
