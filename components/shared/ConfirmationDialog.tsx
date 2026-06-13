"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-surface-900 border border-white/[0.08] rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl"
          >
            {/* Close button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1 bg-surface-600/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-3 mt-2">
              <div className={cn(
                "p-3 rounded-2xl flex items-center justify-center border",
                variant === "danger" ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" :
                variant === "warning" ? "bg-brand-gold/10 border-brand-gold/20 text-brand-gold" :
                "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
              )}>
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="font-jakarta font-bold text-text-primary text-base leading-tight">
                {title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/[0.04]">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface-600/20 transition-all disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 disabled:opacity-50",
                  variant === "danger" ? "bg-brand-accent hover:bg-brand-accent/90 hover:shadow-glow-accent" :
                  variant === "warning" ? "bg-brand-gold hover:bg-brand-gold/90 text-[#0A0B14]" :
                  "bg-brand-primary hover:bg-brand-primary/90 hover:shadow-glow"
                )}
              >
                {isLoading && (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
