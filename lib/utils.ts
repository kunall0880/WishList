import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx — resolves conflicts intelligently.
 * Example: cn("px-4 py-2", condition && "px-6") → "px-6 py-2"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees (₹).
 * Uses the en-IN locale for lakhs/crores grouping.
 * Example: formatCurrency(420000) → "₹4,20,000"
 */
export function formatCurrency(
  amount: number,
  options?: { decimals?: number; compact?: boolean }
): string {
  const { decimals = 0, compact = false } = options ?? {};

  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a number with Indian locale grouping (lakhs/crores).
 * Example: formatNumber(1500000) → "15,00,000"
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage value.
 * Example: formatPercent(82.5) → "82.5%"
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
