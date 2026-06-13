"use client";

import { LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/lib/auth-provider";
import { useState } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const greeting = getGreeting();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userName = user?.name || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-surface-800/30 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      {/* Left: Greeting & mobile menu toggle */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg bg-surface-600/30 hover:bg-surface-600/50 transition-colors focus-ring"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-text-secondary" />
          </button>
        )}
        <div>
          <h2 className="text-base sm:text-lg font-jakarta font-bold text-text-primary leading-tight">
            {greeting}, {userName.split(" ")[0]} 👋
          </h2>
          <p className="text-[10px] sm:text-xs text-text-muted">{today}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <NotificationBell />

        <ThemeToggle />

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-sm font-bold hover:shadow-glow transition-shadow"
          >
            {initials}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-700 border border-white/[0.06] shadow-lg z-50">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-text-primary">{userName}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-600/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
