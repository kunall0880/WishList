"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, Sparkles } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(r => r.json()).then(r => r.data);

export default function NotificationBell() {
  const { data: notifications = [], mutate } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 15000, // Refresh notifications every 15 seconds
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key to close dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      const updated = notifications.map((n: any) => n.id === id ? { ...n, read: true } : n);
      mutate(updated, false);

      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        mutate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      const updated = notifications.map((n: any) => ({ ...n, read: true }));
      mutate(updated, false);

      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        mutate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl bg-surface-600/50 hover:bg-surface-600 transition-colors focus-ring",
          isOpen && "bg-surface-600 text-text-primary"
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5 text-text-secondary hover:text-text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-accent text-[9px] font-bold text-white shadow-md animate-in zoom-in duration-200">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/[0.06] bg-surface-700/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] bg-surface-800/50">
              <h3 className="font-jakarta font-semibold text-text-primary text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Bell className="h-8 w-8 text-text-muted mb-2" />
                  <p className="text-xs font-semibold text-text-primary">All caught up!</p>
                  <p className="text-[10px] text-text-muted mt-1">No notifications for now.</p>
                </div>
              ) : (
                notifications.map((n: any) => {
                  const isSuccess = n.type === "SUCCESS";
                  const isWarning = n.type === "WARNING" || n.type === "DANGER";
                  
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={cn(
                        "p-4 text-left transition-colors cursor-pointer flex items-start gap-3 relative",
                        !n.read ? "bg-white/[0.02] hover:bg-white/[0.04]" : "hover:bg-white/[0.01]"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "p-2 rounded-xl flex-shrink-0 mt-0.5",
                        isSuccess ? "bg-emerald-500/10 text-emerald-400" :
                        isWarning ? "bg-amber-500/10 text-amber-400" :
                        "bg-brand-primary/10 text-brand-primary"
                      )}>
                        {isSuccess ? <Check className="h-3.5 w-3.5" /> :
                         isWarning ? <AlertTriangle className="h-3.5 w-3.5" /> :
                         <Info className="h-3.5 w-3.5" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <p className={cn(
                          "text-xs font-semibold text-text-primary leading-snug",
                          !n.read && "text-white font-bold"
                        )}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-text-secondary leading-relaxed break-words">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-text-muted pt-1">
                          {new Date(n.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>

                      {/* Unread dot indicator */}
                      {!n.read && (
                        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-brand-primary" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
