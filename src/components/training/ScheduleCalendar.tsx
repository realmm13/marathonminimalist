'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Settings,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  isToday, 
  addWeeks, 
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth
} from 'date-fns';
import { cn } from '@/lib/utils';
import { WorkoutType } from '@/generated/prisma';
import { WorkoutAssignmentEngine, WorkoutAssignmentPreferences } from '@/lib/training/workout-assignment-engine';
import { RestDayManager, RestDayAnalysis } from '@/lib/training/rest-day-manager';

export interface ScheduleCalendarProps {
  selectedWorkoutDays: number[]; // 1=Monday, 7=Sunday
  onWorkoutDaysChange: (days: number[]) => void;
  currentWeek?: number;
  totalWeeks?: number;
  view?: 'week' | 'month';
  className?: string;
  maxWorkoutDays?: number;
  minWorkoutDays?: number;
  showWeekNumbers?: boolean;
  allowWeekByWeekAdjustments?: boolean;
  weeklyOverrides?: Record<number, number[]>; // week -> workout days for that week
  onWeeklyOverrideChange?: (week: number, days: number[]) => void;
  
  // Rest day props
  preferredRestDays?: number[];
  onPreferredRestDaysChange?: (days: number[]) => void;
  showRestDayControls?: boolean;
  enforceRestDays?: boolean;
  onEnforceRestDaysChange?: (enforce: boolean) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const DAY_ABBREVIATIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ScheduleCalendar({
  selectedWorkoutDays,
  onWorkoutDaysChange,
  currentWeek = 1,
  totalWeeks = 14,
  view = 'week',
  className,
  maxWorkoutDays = 4,
  minWorkoutDays = 3,
  showWeekNumbers = true,
  allowWeekByWeekAdjustments = false,
  weeklyOverrides = {},
  onWeeklyOverrideChange,
  preferredRestDays,
  onPreferredRestDaysChange,
  showRestDayControls = false,
  enforceRestDays,
  onEnforceRestDaysChange,
}: ScheduleCalendarProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek || 1);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [customizingWeek, setCustomizingWeek] = useState<number | null>(null);

  // Rest day analysis
  const restDayAnalysis = useMemo((): RestDayAnalysis | null => {
    if (!showRestDayControls || !preferredRestDays) return null;
    
    const preferences: WorkoutAssignmentPreferences = {
      preferredRestDays,
      enforceRestDays: enforceRestDays || false
    };
    
    return RestDayManager.validateRestDays(
      selectedWorkoutDays,
      preferredRestDays,
      preferences
    );
  }, [selectedWorkoutDays, preferredRestDays, enforceRestDays, showRestDayControls]);

  // Calculate the start of the current week (Monday)
  const weekStart = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday = 1
    return addWeeks(start, selectedWeek - currentWeek);
  }, [selectedWeek, currentWeek]);

  // Get workout days for a specific week (considering overrides)
  const getWorkoutDaysForWeek = (week: number): number[] => {
    if (weeklyOverrides && weeklyOverrides[week]) {
      return weeklyOverrides[week] || [];
    }
    return selectedWorkoutDays;
  };

  // Handle day selection for global schedule
  const handleDayToggle = useCallback((dayOfWeek: number) => {
    const newDays = selectedWorkoutDays.includes(dayOfWeek)
      ? selectedWorkoutDays.filter(d => d !== dayOfWeek)
      : [...selectedWorkoutDays, dayOfWeek].sort();

    // Validate constraints
    if (newDays.length >= minWorkoutDays && newDays.length <= maxWorkoutDays) {
      onWorkoutDaysChange(newDays);
    }
  }, [selectedWorkoutDays, onWorkoutDaysChange, minWorkoutDays, maxWorkoutDays]);

  // Handle day selection for specific week override
  const handleWeeklyDayToggle = useCallback((week: number, dayOfWeek: number) => {
    if (!allowWeekByWeekAdjustments || !onWeeklyOverrideChange) return;

    const currentWeekDays = getWorkoutDaysForWeek(week);
    const newDays = currentWeekDays.includes(dayOfWeek)
      ? currentWeekDays.filter(d => d !== dayOfWeek)
      : [...currentWeekDays, dayOfWeek].sort();

    // Validate constraints
    if (newDays.length >= minWorkoutDays && newDays.length <= maxWorkoutDays) {
      onWeeklyOverrideChange(week, newDays);
    }
  }, [allowWeekByWeekAdjustments, onWeeklyOverrideChange, getWorkoutDaysForWeek, minWorkoutDays, maxWorkoutDays]);

  // Navigation handlers
  const handlePreviousWeek = () => {
    setSelectedWeek(prev => Math.max(1, prev - 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(prev => Math.min(totalWeeks, prev + 1));
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subWeeks(prev, 4));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addWeeks(prev, 4));
  };

  // Reset week override
  const handleResetWeekOverride = useCallback((week: number) => {
    if (!allowWeekByWeekAdjustments || !onWeeklyOverrideChange) return;
    onWeeklyOverrideChange(week, []);
    setCustomizingWeek(null);
  }, [allowWeekByWeekAdjustments, onWeeklyOverrideChange]);

  // Render day cell
  const renderDayCell = useCallback((
    dayOfWeek: number, 
    date: Date, 
    isCurrentWeek: boolean = false,
    weekNumber?: number
  ) => {
    const isWorkoutDay = weekNumber 
      ? getWorkoutDaysForWeek(weekNumber).includes(dayOfWeek)
      : selectedWorkoutDays.includes(dayOfWeek);
    
    const isEditingThisWeek = weekNumber === customizingWeek;
    const hasOverride = weekNumber && weeklyOverrides && weeklyOverrides[weekNumber]?.length > 0;
    const isClickable = !weekNumber || isEditingThisWeek;

    return (
      <div
        key={`${date.toISOString()}-${dayOfWeek}`}
        className={cn(
          "relative p-3 border rounded-lg transition-all duration-200 cursor-pointer",
          "hover:border-primary/50 hover:shadow-sm",
          isWorkoutDay && "bg-primary/10 border-primary/30",
          !isWorkoutDay && "bg-background border-border",
          isToday(date) && "ring-2 ring-primary/20",
          isCurrentWeek && "shadow-md",
          !isClickable && "cursor-default opacity-75",
          hasOverride && !isEditingThisWeek && "border-orange-300 bg-orange-50"
        )}
        onClick={() => {
          if (weekNumber && isEditingThisWeek) {
            handleWeeklyDayToggle(weekNumber, dayOfWeek);
          } else if (!weekNumber) {
            handleDayToggle(dayOfWeek);
          }
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            {DAY_ABBREVIATIONS[dayOfWeek - 1]}
          </span>
          <span className="text-sm font-medium">
            {format(date, 'd')}
          </span>
          {isWorkoutDay && (
            <div className="w-2 h-2 bg-primary rounded-full" />
          )}
          {hasOverride && !isEditingThisWeek && (
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </div>
        
        {isToday(date) && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-primary rounded-full" />
          </div>
        )}
      </div>
    );
  }, [
    selectedWorkoutDays, 
    getWorkoutDaysForWeek, 
    customizingWeek, 
    weeklyOverrides,
    handleDayToggle, 
    handleWeeklyDayToggle
  ]);

  // Week view
  if (view === 'week') {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const dayOfWeek = i + 1; // 1=Monday, 7=Sunday
      const date = addDays(weekStart, i);
      return { dayOfWeek, date };
    });

    const currentWeekDays = getWorkoutDaysForWeek(selectedWeek);
    const hasWeekOverride = weeklyOverrides && weeklyOverrides[selectedWeek]?.length > 0;

    return (
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="heading-5 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Configuration
            </h3>
            {showWeekNumbers && (
              <Badge variant="outline" color="blue">
                Week {selectedWeek} of {totalWeeks}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              disabled={selectedWeek <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              disabled={selectedWeek >= totalWeeks}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week-by-week adjustment controls */}
        {allowWeekByWeekAdjustments && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Week-specific adjustments</span>
              {hasWeekOverride && (
                <Badge variant="outline" color="orange" size="sm">
                  Custom schedule
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {customizingWeek === selectedWeek ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomizingWeek(null)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Done
                  </Button>
                  {hasWeekOverride && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetWeekOverride(selectedWeek)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomizingWeek(selectedWeek)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Customize
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map(({ dayOfWeek, date }) => 
              renderDayCell(dayOfWeek, date, true, selectedWeek)
            )}
          </div>
        </Card>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {currentWeekDays.length} workout days selected
            {currentWeekDays.length < minWorkoutDays && (
              <span className="text-destructive ml-1">
                (minimum {minWorkoutDays} required)
              </span>
            )}
          </span>
          <span>
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    );
  }

  // Month view (simplified for now)
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="heading-5 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Schedule Overview
        </h3>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {DAY_ABBREVIATIONS.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Month days */}
          {monthDays.map(date => {
            const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7
            const isWorkoutDay = selectedWorkoutDays.includes(dayOfWeek);
            
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "p-2 text-center text-sm rounded transition-colors",
                  isWorkoutDay && "bg-primary/10 text-primary font-medium",
                  !isWorkoutDay && "text-muted-foreground",
                  isToday(date) && "bg-primary text-primary-foreground font-bold",
                  !isSameMonth(date, selectedMonth) && "opacity-30"
                )}
              >
                {format(date, 'd')}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary */}
      <div className="text-sm text-muted-foreground text-center">
        {selectedWorkoutDays.length} workout days per week: {' '}
        {selectedWorkoutDays.map(day => DAYS_OF_WEEK[day - 1]).join(', ')}
      </div>
    </div>
  );
} 