"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Sliders,
  PieChart,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
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

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-white/[0.06] bg-surface-800/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo + collapse */}
      <div className="flex h-20 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-violet shadow-glow flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-jakarta font-bold text-text-primary whitespace-nowrap overflow-hidden"
              >
                Wish<span className="text-brand-primary">list</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-600/50 transition-colors",
            collapsed && "ml-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-text-secondary hover:bg-surface-600/30 hover:text-text-primary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-brand-primary" : "text-text-muted group-hover:text-text-primary"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-primary"
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                />
              )}

              {/* Tooltip for collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-surface-700 text-text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* Bottom nav */}
      <nav className="px-3 py-4 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-600/30 hover:text-text-primary transition-colors group relative"
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0 text-text-muted group-hover:text-text-primary" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-surface-700 text-text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-white/[0.06] px-3 py-4">
        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <div className="h-8 w-8 rounded-full bg-surface-600/50 animate-pulse flex-shrink-0" />
          ) : user?.image ? (
            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 relative">
              <Image
                src={user.image}
                alt={user.name ?? 'User avatar'}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {(user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden flex-1"
              >
                {status === 'loading' ? (
                  <div className="h-4 w-24 rounded bg-surface-600/50 animate-pulse" />
                ) : (
                  <span className="text-sm font-medium text-white truncate block max-w-[120px]">
                    {user?.name ?? user?.email?.split('@')[0] ?? 'User'}
                  </span>
                )}
                {status !== 'loading' && (
                  <div className="flex items-center mt-0.5">
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
                      ((user as any)?.plan ?? 'FREE') === 'FREE'    && 'bg-surface-600 text-text-muted',
                      ((user as any)?.plan ?? 'FREE') === 'PRO'     && 'bg-violet-600/20 text-violet-400 border border-violet-600/30',
                      ((user as any)?.plan ?? 'FREE') === 'PREMIUM' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                    )}>
                      {((user as any)?.plan ?? 'FREE') === 'FREE' ? 'Free' : ((user as any)?.plan ?? 'FREE') === 'PRO' ? 'Pro' : 'Premium'}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
