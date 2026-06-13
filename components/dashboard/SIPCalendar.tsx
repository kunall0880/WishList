"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  name: string;
  emoji: string;
  sipDate: number;
  currentSIP: number;
  calculations?: {
    requiredSIP?: number;
  };
}

interface SIPCalendarProps {
  goals: Goal[];
}

export function SIPCalendar({ goals = [] }: SIPCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month details
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentMonthName = monthNames[month];
  
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Create list of calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Find goals scheduled on each date
  const getGoalsForDate = (date: number) => {
    return goals.filter(g => g.sipDate === date);
  };

  const todayDate = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  // Next month / prev month controls
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get chronological list of upcoming SIPs
  const sipsList = goals
    .map(g => ({
      ...g,
      amount: g.calculations?.requiredSIP ?? g.currentSIP ?? 0,
      isPaid: isCurrentMonth && todayDate > g.sipDate,
    }))
    .sort((a, b) => a.sipDate - b.sipDate);

  return (
    <GlassCard padding="lg" className="h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-jakarta font-semibold text-text-primary text-card-heading flex items-center gap-1.5">
            <Calendar className="h-5 w-5 text-brand-secondary" /> SIP Schedule
          </h3>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-surface-600/50 text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-text-primary min-w-[70px] text-center">
              {currentMonthName.slice(0, 3)} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-surface-600/50 text-text-muted hover:text-text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Small Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-4">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <div key={d} className="text-text-muted font-bold py-1">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            
            const dayGoals = getGoalsForDate(day);
            const hasSip = dayGoals.length > 0;
            const isToday = isCurrentMonth && day === todayDate;
            const isPast = isCurrentMonth && day < todayDate;

            return (
              <div 
                key={day}
                className={cn(
                  "relative py-1.5 rounded-lg text-text-secondary font-medium transition-all",
                  isToday && "bg-brand-primary text-white font-bold",
                  !isToday && hasSip && "bg-brand-primary/10 border border-brand-primary/20",
                  !isToday && !hasSip && "hover:bg-surface-600/20"
                )}
                title={hasSip ? `${dayGoals.length} SIP(s) scheduled` : undefined}
              >
                <span>{day}</span>
                {hasSip && !isToday && (
                  <span className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                    isPast ? "bg-emerald-500" : "bg-brand-primary"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming List */}
        <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
          {sipsList.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No active SIP goals scheduled.</p>
          ) : (
            sipsList.map(sip => (
              <div 
                key={sip.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-600/20 border border-white/[0.02] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{sip.emoji}</span>
                  <div>
                    <p className="font-semibold text-text-primary truncate max-w-[120px]">{sip.name}</p>
                    <p className="text-[10px] text-text-muted">Due on {sip.sipDate} {currentMonthName.slice(0, 3)}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-bold text-text-primary">₹{sip.amount.toLocaleString("en-IN")}</p>
                    <p className="text-[9px] text-text-muted">Auto-debit</p>
                  </div>
                  {sip.isPaid ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-brand-primary" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}
