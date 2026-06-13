/**
 * Wishlist AI — Error Boundary Component
 *
 * Catches render errors in children and shows a fallback UI.
 * Wrap chart components and AI insight panels with this.
 */
"use client";

import React from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <GlassCard padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/10">
              <AlertTriangle className="h-7 w-7 text-brand-accent" />
            </div>
            <div>
              <h3 className="font-jakarta font-semibold text-text-primary text-lg mb-1">
                {this.props.fallbackTitle ?? "Something went wrong"}
              </h3>
              <p className="text-sm text-text-muted max-w-sm">
                {this.props.fallbackDescription ??
                  "An error occurred while rendering this component. Please try again."}
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <p className="text-xs text-brand-accent/70 mt-2 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors px-4 py-2 rounded-xl hover:bg-brand-primary/10"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}
