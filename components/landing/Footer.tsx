"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Simulator", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "API", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Disclaimer", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-surface-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-violet">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-jakarta font-bold text-text-primary">
                Wish<span className="text-brand-primary">list</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-[240px]">
              AI-powered goal-based financial planning for Indian investors.
              Turn your dreams into investment plans.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-caption uppercase text-text-muted tracking-widest mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © 2026 WishList. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Made with 💜 for Indian investors
          </p>
        </div>

        {/* Disclaimer */}
        <div className="pb-8">
          <p className="text-[11px] text-text-muted/60 leading-relaxed max-w-3xl">
            Disclaimer: WishList provides educational tools and projections
            for informational purposes only. It does not constitute financial
            advice. Past returns do not guarantee future performance. Mutual fund
            investments are subject to market risks. Please read all
            scheme-related documents carefully before investing.
          </p>
        </div>
      </div>
    </footer>
  );
}
