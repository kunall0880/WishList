"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: 1,
    icon: Target,
    title: "Enter your goal",
    description:
      "Pick a dream — Europe trip, first home, retirement. Set your target amount and timeline.",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "AI builds your plan",
    description:
      "Our AI analyzes your finances and creates a personalized SIP strategy with optimal allocation.",
  },
  {
    number: 3,
    icon: TrendingUp,
    title: "Start investing",
    description:
      "Follow your roadmap, track progress in real-time, and adjust as life happens.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 lg:py-32 relative">
      {/* Section heading */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="text-caption uppercase text-brand-primary tracking-widest">
            Simple process
          </span>
          <h2 className="mt-3 font-jakarta text-section text-text-primary">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
            Go from dream to investment plan in three simple steps. No finance
            degree needed.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative grid md:grid-cols-3 gap-8 lg:gap-12"
        >
          {/* Connecting line — desktop only */}
          <div
            className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-px"
            aria-hidden="true"
          >
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 1"
            >
              <motion.line
                x1="0"
                y1="0.5"
                x2="100"
                y2="0.5"
                stroke="rgb(108, 99, 255)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                strokeOpacity="0.3"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number badge */}
              <div className="relative mb-6">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl",
                    "bg-gradient-violet shadow-glow"
                  )}
                >
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-[#0A0B14] font-mono-numbers">
                  {step.number}
                </span>
              </div>

              {/* Text */}
              <h3 className="font-jakarta text-card-heading text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm max-w-[280px] leading-relaxed">
                {step.description}
              </p>

              {/* Mobile connecting line — between items */}
              {i < steps.length - 1 && (
                <div
                  className="md:hidden w-px h-8 bg-gradient-to-b from-brand-primary/30 to-transparent mt-6"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
