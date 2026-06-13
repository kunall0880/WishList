"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Shield } from "lucide-react";

export function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="cta" ref={ref} className="py-24 lg:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF] via-[#5B52E0] to-[#4338CA]" />

          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* Floating circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 animate-float-1" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 animate-float-2" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-white/5 animate-float-3" />

            {/* Grid pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-jakarta text-section text-white"
            >
              Ready to start planning?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 text-lg text-white/70 max-w-xl mx-auto"
            >
              Join 50,000+ investors who trust WishList to turn their dreams
              into actionable investment plans.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.a
                href="/register"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-[#4338CA] font-bold px-8 py-4 rounded-xl text-base flex items-center gap-2 hover:shadow-xl transition-shadow duration-300 w-full sm:w-auto justify-center"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50"
            >
              <Shield className="h-4 w-4" />
              <span>No credit card required · Free forever plan available</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
