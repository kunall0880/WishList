"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  Target,
  Sliders,
  PieChart,
  FileText,
  Settings,
  HelpCircle,
  Sparkles,
  Crown,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/goals", icon: Target, label: "My Goals" },
  { href: "/simulator", icon: Sliders, label: "Simulator" },
  { href: "/portfolio", icon: PieChart, label: "Portfolio" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

const bottomItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { logout } = useAuth();
  const user = session?.user;
  const plan = (user as any)?.plan ?? "FREE";

  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-white/[0.06] bg-surface-800/95 backdrop-blur-xl p-4 md:hidden"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-2">
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-violet shadow-glow flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-jakarta font-bold text-text-primary">
                  Wish<span className="text-brand-primary">list</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-600/50 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-brand-primary/10 text-brand-primary font-semibold"
                        : "text-text-secondary hover:bg-surface-600/30 hover:text-text-primary"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-brand-primary" : "text-text-muted group-hover:text-text-primary"
                      )}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="mobile-drawer-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 rounded-r-full bg-brand-primary"
                        transition={{ type: "spring", damping: 20, stiffness: 200 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Separator */}
            <div className="mx-2 my-2 h-px bg-white/[0.06]" />

            {/* Bottom menu & user info */}
            <div className="px-2 space-y-4 pb-safe">
              <nav className="space-y-1">
                {bottomItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-600/30 hover:text-text-primary transition-colors group"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0 text-text-muted group-hover:text-text-primary" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors group"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0 text-text-muted group-hover:text-red-400" />
                  <span>Logout</span>
                </button>
              </nav>

              {/* User profile */}
              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-3">
                  {status === 'loading' ? (
                    <div className="h-10 w-10 rounded-full bg-surface-600/50 animate-pulse flex-shrink-0" />
                  ) : user?.image ? (
                    <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={user.image}
                        alt={userName}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div>
                    {status === 'loading' ? (
                      <div className="h-4 w-24 rounded bg-surface-600/50 animate-pulse mb-1.5" />
                    ) : (
                      <p className="text-sm font-semibold text-text-primary truncate max-w-[150px]">
                        {userName}
                      </p>
                    )}
                    {status !== 'loading' && (
                      <div className="flex items-center mt-0.5">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
                          plan === 'FREE'    && 'bg-surface-600 text-text-muted',
                          plan === 'PRO'     && 'bg-violet-600/20 text-violet-400 border border-violet-600/30',
                          plan === 'PREMIUM' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                        )}>
                          {plan === 'FREE' ? 'Free' : plan === 'PRO' ? 'Pro' : 'Premium'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
