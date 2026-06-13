"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { MobileDrawer } from "@/components/shared/MobileDrawer";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      {/* Sidebar — desktop */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-6"
        >
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Mobile bottom tab bar with active state dot indicator */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-white/[0.06] bg-surface-800/95 backdrop-blur-xl px-2 py-2 safe-area-bottom">
        {[
          { href: "/dashboard", icon: "📊", label: "Dashboard" },
          { href: "/goals", icon: "🎯", label: "Goals" },
          { href: "/simulator", icon: "⚙️", label: "Simulator" },
          { href: "/portfolio", icon: "📈", label: "Portfolio" },
          { href: "/settings", icon: "👤", label: "Profile" },
        ].map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 relative transition-colors",
                isActive ? "text-brand-primary" : "text-text-muted hover:text-text-primary"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-active-dot"
                  className="absolute bottom-0 h-1 w-1 rounded-full bg-brand-primary"
                  transition={{ type: "spring", damping: 15, stiffness: 155 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
