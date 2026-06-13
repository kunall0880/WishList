"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  elevated?: boolean;
  as?: "div" | "section" | "article";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  padding = "md",
  elevated = false,
  as: Component = "div",
}: GlassCardProps) {
  const MotionComponent = Component === "section"
    ? motion.section
    : Component === "article"
    ? motion.article
    : motion.div;

  return (
    <MotionComponent
      className={cn(
        elevated ? "glass-elevated" : "glass-card",
        paddingMap[padding],
        glow && "hover:shadow-glow",
        className
      )}
      {...(hover
        ? {
            whileHover: {
              y: -4,
              boxShadow: "0 20px 60px rgba(108, 99, 255, 0.2)",
              transition: { duration: 0.25, ease: "easeOut" },
            },
            whileTap: { scale: 0.98 },
          }
        : {})}
    >
      {children}
    </MotionComponent>
  );
}
