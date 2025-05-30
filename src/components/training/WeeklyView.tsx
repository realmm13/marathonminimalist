'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  MapPin,
  Target,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { WorkoutType } from '@/generated/prisma';
import { cn } from '@/lib/utils';

export interface WeeklyWorkout {
  id: string;
  name: string;
  description?: string;
  type: WorkoutType;
  week: number;
  day: number;
  scheduledDate: Date;
  distance?: number;
  duration?: number;
  pace?: string;
  isCompleted: boolean;
  intervals?: Array<{
    distance: number;
    pace: string;
    rest?: string;
  }>;
}

interface WeeklyViewProps {
  workouts: WeeklyWorkout[];
  currentWeek?: number;
  onWorkoutClick?: (workout: WeeklyWorkout) => void;
  onWorkoutComplete?: (workout: WeeklyWorkout) => void;
  onWorkoutUncomplete?: (workout: WeeklyWorkout) => void;
  className?: string;
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

const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  EASY_RUN: 'bg-green-100 text-green-800 border-green-200',
  TEMPO_RUN: 'bg-orange-100 text-orange-800 border-orange-200',
  INTERVAL_800M: 'bg-red-100 text-red-800 border-red-200',
  LONG_RUN: 'bg-blue-100 text-blue-800 border-blue-200',
  RECOVERY_RUN: 'bg-gray-100 text-gray-800 border-gray-200',
  MARATHON_RACE: 'bg-purple-100 text-purple-800 border-purple-200',
};

const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  EASY_RUN: 'Easy Run',
  TEMPO_RUN: 'Tempo',
  INTERVAL_800M: 'Intervals',
  LONG_RUN: 'Long Run',
  RECOVERY_RUN: 'Recovery',
  MARATHON_RACE: 'Marathon Race',
};

export function WeeklyView({ 
  workouts, 
  currentWeek = 1, 
  onWorkoutClick,
  onWorkoutComplete,
  onWorkoutUncomplete,
  className 
}: WeeklyViewProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  // Calculate the start of the current week (Monday)
  const weekStart = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday = 1
    return addWeeks(start, selectedWeek - currentWeek);
  }, [selectedWeek, currentWeek]);

  // Filter workouts for the selected week
  const weekWorkouts = useMemo(() => {
    return workouts.filter(workout => workout.week === selectedWeek);
  }, [workouts, selectedWeek]);

  // Group workouts by day of week
  const workoutsByDay = useMemo(() => {
    const grouped: Record<number, WeeklyWorkout[]> = {};
    
    weekWorkouts.forEach(workout => {
      const dayIndex = workout.day - 1; // Convert to 0-based index (Monday = 0)
      if (!grouped[dayIndex]) {
        grouped[dayIndex] = [];
      }
      grouped[dayIndex].push(workout);
    });
    
    return grouped;
  }, [weekWorkouts]);

  const handlePreviousWeek = () => {
    setSelectedWeek(prev => Math.max(1, prev - 1));
  };

  const handleNextWeek = () => {
    // Assuming 14-week training plan
    setSelectedWeek(prev => Math.min(14, prev + 1));
  };

  const handleWorkoutAction = (workout: WeeklyWorkout, action: 'complete' | 'uncomplete' | 'view') => {
    switch (action) {
      case 'complete':
        onWorkoutComplete?.(workout);
        break;
      case 'uncomplete':
        onWorkoutUncomplete?.(workout);
        break;
      case 'view':
        onWorkoutClick?.(workout);
        break;
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return `${distance.toFixed(1)} mi`;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="heading-3">Week {selectedWeek}</h3>
          <p className="body-small text-muted-foreground">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            disabled={selectedWeek <= 1}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Badge variant="default" color="gray" className="px-3 py-1">
            Week {selectedWeek} of 14
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            disabled={selectedWeek >= 14}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid gap-4 md:grid-cols-7">
        {DAYS_OF_WEEK.map((dayName, dayIndex) => {
          const dayDate = addDays(weekStart, dayIndex);
          const dayWorkouts = workoutsByDay[dayIndex] || [];
          const isCurrentDay = isToday(dayDate);
          
          return (
            <Card 
              key={dayIndex}
              className={cn(
                'card-enhanced p-4 min-h-[200px] transition-all duration-200',
                isCurrentDay && 'ring-2 ring-primary/20 bg-primary/5'
              )}
            >
              {/* Day Header */}
              <div className="mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={cn(
                    'font-medium text-sm',
                    isCurrentDay ? 'text-primary' : 'text-foreground'
                  )}>
                    {dayName}
                  </h4>
                  {isCurrentDay && (
                    <Badge variant="default" color="blue" className="text-xs px-2 py-0.5">
                      Today
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(dayDate, 'MMM d')}
                </p>
              </div>

              {/* Workouts for this day */}
              <div className="space-y-3">
                {dayWorkouts.length > 0 ? (
                  dayWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm',
                        workout.isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-background border-border hover:border-primary/30'
                      )}
                      onClick={() => handleWorkoutAction(workout, 'view')}
                    >
                      {/* Workout Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">
                            {workout.name}
                          </h5>
                          <Badge 
                            variant="outline" 
                            color="gray"
                            className={cn('text-xs mt-1', WORKOUT_TYPE_COLORS[workout.type])}
                          >
                            {WORKOUT_TYPE_LABELS[workout.type]}
                          </Badge>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWorkoutAction(
                              workout, 
                              workout.isCompleted ? 'uncomplete' : 'complete'
                            );
                          }}
                          className="ml-2 p-1 rounded-full hover:bg-background/80 transition-colors"
                        >
                          {workout.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      {/* Workout Details */}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {workout.distance && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{formatDistance(workout.distance)}</span>
                          </div>
                        )}
                        
                        {workout.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(workout.duration)}</span>
                          </div>
                        )}
                        
                        {workout.pace && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{workout.pace}</span>
                          </div>
                        )}
                      </div>

                      {/* Intervals Preview */}
                      {workout.intervals && workout.intervals.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            {workout.intervals.length} intervals
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No workouts scheduled
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Week Summary */}
      {weekWorkouts.length > 0 && (
        <Card className="card-enhanced p-4">
          <h4 className="font-medium mb-3">Week {selectedWeek} Summary</h4>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {weekWorkouts.filter(w => w.isCompleted).length}/{weekWorkouts.length}
              </div>
              <div className="text-xs text-muted-foreground">Workouts</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {formatDistance(weekWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0))}
              </div>
              <div className="text-xs text-muted-foreground">Total Distance</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {Math.round((weekWorkouts.filter(w => w.isCompleted).length / weekWorkouts.length) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Completion</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {weekWorkouts.filter(w => w.type === 'LONG_RUN').length}
              </div>
              <div className="text-xs text-muted-foreground">Long Runs</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 