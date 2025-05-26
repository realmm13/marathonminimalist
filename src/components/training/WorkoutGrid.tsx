'use client';

import React from 'react';
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
}

export function WorkoutGrid({
  workouts,
  startDate = new Date(),
  currentWeek = 1,
  totalWeeks = 14,
  className,
  variant = 'calendar',
  showWeekHeaders = true,
  onWorkoutClick,
  onWorkoutComplete,
}: WorkoutGridProps) {
  // Group workouts by week
  const workoutsByWeek = workouts.reduce((acc, workout) => {
    const week = workout.week;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(workout);
    return acc;
  }, {} as Record<number, WorkoutCardProps[]>);

  // Generate week data
  const weeks = Array.from({ length: totalWeeks }, (_, i) => {
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

  const getWeekProgress = (weekWorkouts: WorkoutCardProps[]) => {
    const completed = weekWorkouts.filter(w => w.isCompleted).length;
    const total = weekWorkouts.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  if (variant === 'list') {
    return (
      <div className={cn("space-y-6", className)}>
        {weeks.map((week) => {
          const progress = getWeekProgress(week.workouts);
          
          return (
            <div key={week.number} className="space-y-3">
              {showWeekHeaders && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      Week {week.number}
                    </h3>
                    <Badge 
                      color={week.isCurrent ? 'blue-500' : week.isPast ? 'green-500' : 'gray-400'}
                      size="sm"
                    >
                      {week.isCurrent ? 'Current' : week.isPast ? 'Complete' : 'Upcoming'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(week.startDate, 'MMM d')} - {format(addDays(week.startDate, 6), 'MMM d')}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {week.workouts.map((workout, index) => (
                  <WorkoutCard
                    key={`${week.number}-${index}`}
                    {...workout}
                    variant="compact"
                    onClick={() => onWorkoutClick?.(workout)}
                    onComplete={() => onWorkoutComplete?.(workout)}
                  />
                ))}
              </div>
              
              {progress.total > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {progress.completed} of {progress.total} workouts completed 
                    ({Math.round(progress.percentage)}%)
                  </span>
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
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3", className)}>
        {workouts.map((workout, index) => (
          <WorkoutCard
            key={index}
            {...workout}
            variant="compact"
            onClick={() => onWorkoutClick?.(workout)}
            onComplete={() => onWorkoutComplete?.(workout)}
          />
        ))}
      </div>
    );
  }

  // Calendar variant - inspired by the design reference
  return (
    <div className={cn("space-y-8", className)}>
      {weeks.map((week) => {
        const progress = getWeekProgress(week.workouts);
        
        return (
          <Card 
            key={week.number} 
            className={cn(
              "p-6 border border-border/50 bg-card/30 backdrop-blur-sm",
              week.isCurrent && "ring-2 ring-primary/20 border-primary/30 bg-primary/5",
              week.isPast && "opacity-90"
            )}
          >
            {/* Week Header */}
            {showWeekHeaders && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">Week {week.number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(week.startDate, 'MMMM d')} - {format(addDays(week.startDate, 6), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <Badge 
                    color={week.isCurrent ? 'blue-500' : week.isPast ? 'green-500' : 'gray-400'}
                    size="md"
                  >
                    {week.isCurrent ? 'Current Week' : week.isPast ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>
                
                {progress.total > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {progress.completed}/{progress.total} Complete
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(progress.percentage)}% progress
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
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
                    <WorkoutCard
                      key={`${week.number}-${index}`}
                      {...workoutProps}
                      onClick={() => onWorkoutClick?.(workoutProps)}
                      onComplete={() => onWorkoutComplete?.(workoutProps)}
                    />
                  );
                })
              ) : (
                <div className="col-span-full flex items-center justify-center py-8 text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No workouts scheduled for this week</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
} 