"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
  rating: number;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer, Bangalore",
    quote:
      "WishList helped me plan my dream Europe trip down to the last rupee. The AI suggested a mix of debt and liquid funds I never would have considered. Starting my SIP felt effortless.",
    initials: "RS",
    rating: 5,
    gradient: "from-[#6C63FF] to-[#9B8FFF]",
  },
  {
    name: "Priya Menon",
    role: "Doctor, Mumbai",
    quote:
      "I finally have clarity on my retirement plan. The Monte Carlo simulation showed me exactly how confident I can be about my corpus. This is what financial planning should feel like.",
    initials: "PM",
    rating: 5,
    gradient: "from-[#06D6A0] to-[#34D399]",
  },
  {
    name: "Arjun Patel",
    role: "Chartered Accountant, Ahmedabad",
    quote:
      "The SIP calculator alone is worth it. But the AI insights that told me to increase my SIP by just ₹2,000 to hit my goal 6 months early? That's the magic. Brilliant product.",
    initials: "AP",
    rating: 5,
    gradient: "from-[#FFD166] to-[#FBBF24]",
  },
  {
    name: "Sneha Iyer",
    role: "Teacher, Chennai",
    quote:
      "Simple, beautiful, and actually useful. I set up goals for my daughter's education and our home renovation in under 5 minutes. The progress tracking keeps me motivated every month.",
    initials: "SI",
    rating: 5,
    gradient: "from-[#FF6B6B] to-[#FF8787]",
  },
  {
    name: "Vikram Singh",
    role: "Entrepreneur, Delhi",
    quote:
      "Better than any financial advisor I've hired. WishList understood my risk profile perfectly and gave me a balanced portfolio that outperformed my advisor's picks. Seriously impressed.",
    initials: "VS",
    rating: 5,
    gradient: "from-[#9B8FFF] to-[#6C63FF]",
  },
  {
    name: "Deepa Nair",
    role: "UX Designer, Pune",
    quote:
      "Love the dark mode and the AI insights. As a designer, I appreciate the attention to detail in every chart and card. It's rare to see a fintech product this well-crafted.",
    initials: "DN",
    rating: 5,
    gradient: "from-[#06D6A0] to-[#6C63FF]",
  },
];

// Duplicate for infinite scroll
const allTestimonials = [...testimonials, ...testimonials];

export function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-caption uppercase text-brand-primary tracking-widest">
            Testimonials
          </span>
          <h2 className="mt-3 font-jakarta text-section text-text-primary">
            Loved by investors
            <br className="hidden sm:block" /> across India
          </h2>
        </motion.div>
      </div>

      {/* Scrolling testimonials row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
      >
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface-900 to-transparent z-10 pointer-events-none" />

        {/* Scrolling container */}
        <div className="flex animate-scroll-x hover:[animation-play-state:paused] w-max gap-6 px-6">
          {allTestimonials.map((testimonial, i) => (
            <div key={`${testimonial.name}-${i}`} className="w-[380px] flex-shrink-0">
              <GlassCard padding="lg" className="h-full">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-brand-gold text-brand-gold"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-white text-sm font-bold flex-shrink-0`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
