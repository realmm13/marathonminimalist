'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { useCalendar } from './useCalendar';
import { CalendarEvent, DEFAULT_WORKOUT_COLORS, SIMPLIFIED_WORKOUT_DISPLAY_NAMES } from './CalendarTypes';
import { cn } from '@/lib/utils';

interface CalendarProps {
  workouts?: any[];
  marathonDate?: Date;
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
}

export function Calendar({
  workouts = [],
  marathonDate,
  className,
  onEventClick,
  onDateSelect,
}: CalendarProps) {
  const {
    state,
    calendarMonth,
    monthYearDisplay,
    goToToday,
    goToPrevious,
    goToNext,
    onDateSelect: handleDateSelect,
    onEventClick: handleEventClick,
  } = useCalendar({
    workouts,
    marathonDate,
  });

  const handleDateClick = (date: Date) => {
    handleDateSelect(date);
    onDateSelect?.(date);
  };

  const handleEventClickInternal = (event: CalendarEvent) => {
    handleEventClick(event);
    onEventClick?.(event);
  };

  if (state.error) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <p className="text-destructive">Error loading calendar: {state.error}</p>
      </div>
    );
  }

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className={cn(
      "bg-background rounded-2xl p-6 w-full",
      "border border-border shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevious}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">
            {monthYearDisplay}
          </h2>
        </div>
        
        <button
          onClick={goToNext}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground text-center py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarMonth.weeks.map((week) =>
          week.days.map((day) => {
            const isToday = day.isToday;
            const isCurrentMonth = day.isCurrentMonth;
            const hasMarathon = day.events.some(event => event.type === 'race');
            const workoutEvent = day.events.find(event => event.type === 'workout');

            return (
              <button
                key={day.date.toISOString()}
                onClick={() => handleDateClick(day.date)}
                className={cn(
                  "relative h-12 w-full rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isToday && "ring-2 ring-primary"
                )}
              >
                {/* Date number */}
                <span className={cn(
                  "relative z-10",
                  hasMarathon && "opacity-0"
                )}>
                  {day.date.getDate()}
                </span>

                {/* Marathon indicator */}
                {hasMarathon && (
                  <div className="absolute inset-0 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                )}

                {/* Workout indicator */}
                {workoutEvent && !hasMarathon && workoutEvent.workoutType && (
                  <div 
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full"
                    style={{ backgroundColor: DEFAULT_WORKOUT_COLORS[workoutEvent.workoutType] }}
                  />
                )}

                {/* Multiple events indicator */}
                {day.events.length > 1 && !hasMarathon && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Long Run</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-muted-foreground">Tempo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-muted-foreground">Intervals</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-purple-500" />
            <span className="text-muted-foreground">Race Day</span>
          </div>
        </div>
      </div>

      {/* Today button */}
      <div className="mt-4 text-center">
        <button
          onClick={goToToday}
          className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
} 