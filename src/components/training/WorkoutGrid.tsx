'use client';

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { WorkoutCard, WorkoutCardProps } from './WorkoutCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, isPast } from 'date-fns';

export interface WorkoutGridProps {
  workouts: WorkoutCardProps[];
  startDate?: Date;
  currentWeek?: number;
  totalWeeks?: number;
  className?: string;
  variant?: 'calendar' | 'list' | 'compact';
  showWeekHeaders?: boolean;
  onWorkoutClick?: (workout: WorkoutCardProps) => void;
  onWorkoutComplete?: (workout: WorkoutCardProps) => void;
  onWorkoutUncomplete?: (workout: WorkoutCardProps) => void;
}

export const WorkoutGrid = React.memo<WorkoutGridProps>(function WorkoutGrid({
  workouts,
  startDate = new Date(),
  currentWeek = 1,
  totalWeeks = 14,
  className,
  variant = 'calendar',
  showWeekHeaders = true,
  onWorkoutClick,
  onWorkoutComplete,
  onWorkoutUncomplete,
}) {
  // Group workouts by week - memoized for performance
  const workoutsByWeek = useMemo(() => {
    return workouts.reduce((acc, workout) => {
      const week = workout.week;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(workout);
      return acc;
    }, {} as Record<number, WorkoutCardProps[]>);
  }, [workouts]);

  // Generate week data - memoized for performance
  const weeks = useMemo(() => {
    return Array.from({ length: totalWeeks }, (_, i) => {
      const weekNumber = i + 1;
      const weekStartDate = addDays(startDate, i * 7);
      const weekWorkouts = workoutsByWeek[weekNumber] || [];
      
      return {
        number: weekNumber,
        startDate: weekStartDate,
        workouts: weekWorkouts,
        isCurrent: weekNumber === currentWeek,
        isPast: weekNumber < currentWeek,
      };
    });
  }, [totalWeeks, startDate, workoutsByWeek, currentWeek]);

  const getWeekProgress = useCallback((weekWorkouts: WorkoutCardProps[]) => {
    const completed = weekWorkouts.filter(w => w.isCompleted).length;
    const total = weekWorkouts.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleWorkoutClick = useCallback((workout: WorkoutCardProps) => {
    onWorkoutClick?.(workout);
  }, [onWorkoutClick]);

  const handleWorkoutComplete = useCallback((workout: WorkoutCardProps) => {
    onWorkoutComplete?.(workout);
  }, [onWorkoutComplete]);

  const handleWorkoutUncomplete = useCallback((workout: WorkoutCardProps) => {
    onWorkoutUncomplete?.(workout);
  }, [onWorkoutUncomplete]);

  if (variant === 'list') {
    return (
      <div className={cn("space-y-8 animate-fade-in-up", className)}>
        {weeks.map((week, weekIndex) => {
          const progress = getWeekProgress(week.workouts);
          
          return (
            <div key={week.number} className="space-y-4 animate-slide-down" style={{ animationDelay: `${weekIndex * 100}ms` }}>
              {showWeekHeaders && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="heading-3">
                      Week {week.number}
                    </h3>
                    <Badge 
                      color={week.isCurrent ? 'blue' : week.isPast ? 'green' : 'gray'}
                      className={cn(
                        "badge-enhanced",
                        week.isCurrent && 'badge-info animate-pulse-subtle',
                        week.isPast && 'badge-success',
                        !week.isCurrent && !week.isPast && 'badge-secondary'
                      )}
                    >
                      {week.isCurrent ? 'Current' : week.isPast ? 'Complete' : 'Upcoming'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 body-small text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(week.startDate, 'MMM d')} - {format(addDays(week.startDate, 6), 'MMM d')}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {week.workouts.map((workout, index) => (
                  <WorkoutCard
                    key={`${week.number}-${index}`}
                    {...workout}
                    variant="compact"
                    onClick={() => handleWorkoutClick(workout)}
                    onComplete={() => handleWorkoutComplete(workout)}
                    onUncomplete={() => handleWorkoutUncomplete(workout)}
                  />
                ))}
              </div>
              
              {progress.total > 0 && (
                <div className="flex items-center gap-3 body-small text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {progress.completed} of {progress.total} workouts completed 
                    ({Math.round(progress.percentage)}%)
                  </span>
                  <div className="flex-1 max-w-32">
                    <div className="progress-bar h-2">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up", className)}>
        {workouts.map((workout, index) => (
          <div key={index} className="animate-slide-down" style={{ animationDelay: `${index * 50}ms` }}>
            <WorkoutCard
              {...workout}
              variant="compact"
              onClick={() => handleWorkoutClick(workout)}
              onComplete={() => handleWorkoutComplete(workout)}
              onUncomplete={() => handleWorkoutUncomplete(workout)}
            />
          </div>
        ))}
      </div>
    );
  }

  // Calendar variant - inspired by the design reference
  return (
    <div className={cn("space-y-8 animate-fade-in-up", className)}>
      {weeks.map((week, weekIndex) => {
        const progress = getWeekProgress(week.workouts);
        
        return (
          <Card 
            key={week.number} 
            className={cn(
              "card-enhanced p-6 hover-lift group transition-all duration-300",
              week.isCurrent && "ring-2 ring-primary/20 border-primary/30 bg-primary/5 animate-pulse-subtle",
              week.isPast && "opacity-95 hover:opacity-100"
            )}
            style={{ animationDelay: `${weekIndex * 100}ms` }}
          >
            {/* Week Header */}
            {showWeekHeaders && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30 group-hover:border-border/50 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="heading-3 gradient-text">
                      Week {week.number}
                    </h3>
                    <p className="body-small text-muted-foreground">
                      {format(week.startDate, 'MMMM d')} - {format(addDays(week.startDate, 6), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <Badge 
                    color={week.isCurrent ? 'blue' : week.isPast ? 'green' : 'gray'}
                    className={cn(
                      "badge-enhanced transition-all duration-200",
                      week.isCurrent && "badge-info animate-pulse-subtle shadow-md",
                      week.isPast && "badge-success",
                      !week.isCurrent && !week.isPast && "badge-secondary"
                    )}
                  >
                    {week.isCurrent ? 'Current Week' : week.isPast ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>
                
                {progress.total > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-1">
                      <div className="body-small font-semibold">
                        {progress.completed}/{progress.total} Complete
                      </div>
                      <div className="body-xs text-muted-foreground">
                        {Math.round(progress.percentage)}% progress
                      </div>
                    </div>
                    
                    {/* Enhanced progress bar */}
                    <div className="w-24 h-3 progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Workout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {week.workouts.length > 0 ? (
                week.workouts.map((workout, index) => {
                  // Determine if this workout is today, past, etc.
                  const workoutDate = workout.scheduledDate || addDays(week.startDate, index);
                  const workoutProps = {
                    ...workout,
                    isToday: isToday(workoutDate),
                    isPast: isPast(workoutDate) && !isToday(workoutDate),
                    scheduledDate: workoutDate,
                  };
                  
                  return (
                    <div key={`${week.number}-${index}`} className="animate-slide-down" style={{ animationDelay: `${(weekIndex * 7 + index) * 50}ms` }}>
                      <WorkoutCard
                        {...workoutProps}
                        onClick={() => handleWorkoutClick(workoutProps)}
                        onComplete={() => handleWorkoutComplete(workoutProps)}
                        onUncomplete={() => handleWorkoutUncomplete(workoutProps)}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center space-y-3 animate-fade-in-up">
                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto">
                      <Target className="h-8 w-8 opacity-60" />
                    </div>
                    <p className="body-small font-medium">No workouts scheduled</p>
                    <p className="body-xs text-muted-foreground/80">This week is free for rest or cross-training</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}); 