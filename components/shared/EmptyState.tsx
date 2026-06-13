/**
 * Wishlist AI — Empty State Component
 *
 * Reusable empty state with icon, title, description, and optional action.
 */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-20 text-center ${className ?? ""}`}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-primary/10 mb-6">
        <Icon className="h-10 w-10 text-brand-primary" />
      </div>
      <h2 className="font-jakarta text-2xl font-bold text-text-primary mb-2">
        {title}
      </h2>
      <p className="text-text-secondary mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="gradient-cta text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-glow transition-shadow"
        >
          {action.label}
        </Link>
      )}
    </motion.div>
  );
}
