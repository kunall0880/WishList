"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global crash captured by Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0B14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-6 relative z-10 p-6 rounded-3xl border border-brand-accent/20 bg-brand-accent/[0.01] backdrop-blur-md"
      >
        {/* Error symbol */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10 border border-brand-accent/20">
            <AlertTriangle className="h-8 w-8 text-brand-accent animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-jakarta text-2xl font-bold text-white tracking-tight">Calculation Engine Error</h1>
          <p className="text-xs text-text-muted leading-relaxed max-w-sm mx-auto">
            We encountered a computation error modeling your compound interest projection or compiling database records.
          </p>
          {error.message && (
            <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/[0.04] text-[10px] text-brand-accent font-mono break-all max-h-24 overflow-y-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="gradient-cta text-white font-semibold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:shadow-glow transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Reset Simulation
          </button>
          <Link
            href="/dashboard"
            className="border border-white/[0.08] text-text-secondary hover:text-text-primary hover:bg-surface-600/20 font-semibold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
