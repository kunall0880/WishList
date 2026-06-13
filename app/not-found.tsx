"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Home, Target } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0B14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-brand-secondary/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6 relative z-10"
      >
        {/* Animated logo/icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-violet shadow-glow animate-bounce">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-jakarta text-5xl font-black text-white tracking-tight">404</h1>
          <h2 className="font-jakarta text-xl font-bold text-text-primary">Aspiration Lost in Orbit</h2>
          <p className="text-xs text-text-muted leading-relaxed max-w-sm mx-auto">
            The page you are looking for does not exist or has been shifted to another financial asset class. Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/dashboard"
            className="gradient-cta text-white font-semibold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:shadow-glow transition-all"
          >
            <Home className="h-4 w-4" /> Back to Dashboard
          </Link>
          <Link
            href="/goals"
            className="border border-white/[0.08] text-text-secondary hover:text-text-primary hover:bg-surface-600/20 font-semibold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Target className="h-4 w-4" /> View My Goals
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
