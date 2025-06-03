'use client';

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  Zap, 
  Target, 
  CheckCircle2, 
  Circle,
  Calendar,
  Timer,
  Activity,
  Trophy
} from 'lucide-react';
import { WorkoutType } from '@/generated/prisma';
import { format } from 'date-fns';
import { useUserSetting } from '@/hooks/useUserSetting';

// Define distance unit constants to avoid runtime enum issues
const DISTANCE_UNITS = {
  KILOMETERS: 'KILOMETERS',
  MILES: 'MILES'
} as const;

type DistanceUnitType = typeof DISTANCE_UNITS[keyof typeof DISTANCE_UNITS];

export interface WorkoutCardProps {
  // Core workout data
  id?: string;
  name: string;
  description: string;
  type: WorkoutType;
  week: number;
  day?: number;
  scheduledDate?: Date;
  
  // Performance metrics
  distance?: number;
  duration?: number; // in minutes
  pace?: string;
  
  // Race day specific
  isRaceDay?: boolean;
  raceDetails?: {
    startTime?: string;
    location?: string;
    instructions?: string;
  };
  
  // Workout structure
  intervals?: any;
  instructions?: string[];
  structure?: string; // Added structure field for mileage breakdown
  
  // Status and interaction
  isCompleted?: boolean;
  isToday?: boolean;
  isUpcoming?: boolean;
  isPast?: boolean;
  
  // UI variants
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  
  // Event handlers
  onClick?: () => void;
  onComplete?: () => void;
  onUncomplete?: () => void;
}

// Memoized workout type configuration - simplified to 3 types
const WORKOUT_TYPE_CONFIG = {
  [WorkoutType.EASY_RUN]: {
    icon: Activity,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: 'Long Run'
  },
  [WorkoutType.TEMPO_RUN]: {
    icon: Zap,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    label: 'Tempo'
  },
  [WorkoutType.INTERVAL_800M]: {
    icon: Timer,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: 'Intervals'
  },
  [WorkoutType.LONG_RUN]: {
    icon: Activity,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: 'Long Run'
  },
  [WorkoutType.RECOVERY_RUN]: {
    icon: Activity,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: 'Long Run'
  },
  [WorkoutType.MARATHON_RACE]: {
    icon: Trophy,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    label: 'Race Day'
  },
} as const;

export const WorkoutCard = React.memo<WorkoutCardProps>(function WorkoutCard({
  id,
  name,
  description,
  type,
  week,
  day,
  scheduledDate,
  distance,
  duration,
  pace,
  isRaceDay = false,
  raceDetails,
  intervals,
  instructions,
  structure,
  isCompleted = false,
  isToday = false,
  isUpcoming = false,
  isPast = false,
  variant = 'default',
  className,
  onClick,
  onComplete,
  onUncomplete,
}) {
  // Get user's distance unit preference
  const { value: distanceUnitValue } = useUserSetting('marathonDistanceUnit');
  const distanceUnit = (distanceUnitValue as DistanceUnitType) || DISTANCE_UNITS.MILES;

  // Memoized workout type configuration
  const workoutConfig = useMemo(() => {
    return WORKOUT_TYPE_CONFIG[type] || WORKOUT_TYPE_CONFIG[WorkoutType.EASY_RUN];
  }, [type]);

  // Memoized distance conversion
  const convertedDistance = useMemo(() => {
    if (!distance) return null;
    
    if (distanceUnit === DISTANCE_UNITS.MILES) {
      return (distance * 0.621371).toFixed(1);
    }
    return distance.toFixed(1);
  }, [distance, distanceUnit]);

  // Memoized unit label
  const unitLabel = useMemo(() => {
    return distanceUnit === DISTANCE_UNITS.MILES ? 'mi' : 'km';
  }, [distanceUnit]);

  // Memoized pace conversion
  const convertedPace = useMemo(() => {
    if (!pace) return null;
    
    // If pace is already in the correct unit, return as is
    if (distanceUnit === DISTANCE_UNITS.MILES && pace.includes('/mi')) {
      return pace;
    }
    if (distanceUnit === DISTANCE_UNITS.KILOMETERS && pace.includes('/km')) {
      return pace;
    }
    
    // Convert pace if needed
    const paceMatch = pace.match(/(\d+):(\d+)/);
    if (!paceMatch) return pace;
    
    const [, minutes = '0', seconds = '0'] = paceMatch;
    const totalSeconds = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    
    if (distanceUnit === DISTANCE_UNITS.MILES) {
      // Convert from km pace to mile pace
      const milePaceSeconds = totalSeconds * 1.609344;
      const milePaceMinutes = Math.floor(milePaceSeconds / 60);
      const remainingSeconds = Math.round(milePaceSeconds % 60);
      return `${milePaceMinutes}:${remainingSeconds.toString().padStart(2, '0')}/mi`;
    } else {
      // Convert from mile pace to km pace
      const kmPaceSeconds = totalSeconds / 1.609344;
      const kmPaceMinutes = Math.floor(kmPaceSeconds / 60);
      const remainingSeconds = Math.round(kmPaceSeconds % 60);
      return `${kmPaceMinutes}:${remainingSeconds.toString().padStart(2, '0')}/km`;
    }
  }, [pace, distanceUnit]);

  // Memoized duration formatting
  const formattedDuration = useMemo(() => {
    if (!duration) return null;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [duration]);

  // Memoized date formatting
  const formattedDate = useMemo(() => {
    if (!scheduledDate) return null;
    return format(scheduledDate, 'MMM d');
  }, [scheduledDate]);

  // Memoized click handlers
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      onUncomplete?.();
    } else {
      onComplete?.();
    }
  }, [isCompleted, onComplete, onUncomplete]);

  const handleCompleteKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      // Create a synthetic mouse event
      const syntheticEvent = {
        stopPropagation: () => e.stopPropagation(),
        preventDefault: () => e.preventDefault(),
      } as React.MouseEvent;
      handleComplete(syntheticEvent);
    }
  }, [handleComplete]);

  // Determine if this is a marathon race
  const isMarathonRace = type === WorkoutType.MARATHON_RACE;
  const isActualRaceDay = isRaceDay || isMarathonRace;

  // Helper functions
  const convertDistance = (kmValue: number): number => {
    return distanceUnit === DISTANCE_UNITS.MILES ? kmValue * 0.621371 : kmValue;
  };
  
  const getDistanceUnit = (): string => {
    return distanceUnit === DISTANCE_UNITS.MILES ? 'mi' : 'km';
  };

  const formatDistance = (dist: number) => {
    const convertedDistance = convertDistance(dist);
    return convertedDistance.toFixed(1);
  };

  const formatDuration = (dur: number) => {
    const hours = Math.floor(dur / 60);
    const minutes = dur % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Generate accessible status text
  const getStatusText = () => {
    if (isCompleted) return isActualRaceDay ? 'Race completed' : 'Completed';
    if (isToday) return isActualRaceDay ? 'Race day is today!' : 'Scheduled for today';
    if (isPast && !isCompleted) return isActualRaceDay ? 'Missed race' : 'Missed workout';
    if (isUpcoming) return isActualRaceDay ? 'Upcoming race' : 'Upcoming workout';
    return isActualRaceDay ? 'Scheduled race' : 'Scheduled workout';
  };

  // Generate comprehensive aria-label
  const getAriaLabel = () => {
    const parts = [
      name,
      description,
      `Week ${week}`,
      scheduledDate ? format(scheduledDate, 'EEEE, MMMM do') : '',
      distance ? `${formatDistance(distance)} ${getDistanceUnit()}` : '',
      duration ? formatDuration(duration) : '',
      pace ? `at ${pace} pace` : '',
      getStatusText()
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const getStatusIndicator = () => {
    const statusText = getStatusText();
    
    if (isCompleted) {
      return (
        <CheckCircle2 
          className={cn(
            "h-4 w-4",
            isActualRaceDay ? "text-purple-500" : "text-green-500"
          )} 
          aria-label={statusText}
          role="img"
        />
      );
    }
    if (isToday) {
      return (
        <div 
          className={cn(
            "h-3 w-3 rounded-full", 
            isActualRaceDay ? "bg-purple-500 animate-pulse" : workoutConfig.color
          )} 
          aria-label={statusText}
          role="img"
        />
      );
    }
    if (isPast && !isCompleted) {
      return (
        <Circle 
          className="h-4 w-4 text-gray-400" 
          aria-label={statusText}
          role="img"
        />
      );
    }
    return (
      <Circle 
        className="h-4 w-4 text-muted-foreground/40" 
        aria-label={statusText}
        role="img"
      />
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Generate aria-describedby ID
  const ariaDescribedBy = id ? `workout-${id}-description` : undefined;

  // Compact variant for smaller displays
  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          "card-enhanced p-4 cursor-pointer group hover-lift h-full",
          "focus-ring active-press",
          isToday && "ring-2 ring-primary/20 border-primary/30 animate-pulse-subtle",
          isActualRaceDay && isToday && "ring-2 ring-purple-500/30 border-purple-500/40 bg-purple-50/50 animate-pulse-subtle",
          isActualRaceDay && !isToday && "border-purple-500/20 bg-purple-50/20",
          isCompleted && "bg-success/10 border-success/30",
          isCompleted && isActualRaceDay && "bg-purple-100/50 border-purple-500/30",
          isPast && !isCompleted && "opacity-60",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : -1}
        role={onClick ? "button" : "article"}
        aria-label={getAriaLabel()}
        aria-describedby={ariaDescribedBy}
        aria-pressed={onClick && isCompleted ? true : undefined}
      >
        {/* Use flexbox layout to ensure consistent positioning */}
        <div className="flex flex-col h-full">
          {/* Header row with status, icon, and completion button */}
          <div className="flex items-center justify-between min-h-[2.5rem] mb-3">
            <div className="flex items-center gap-2">
              {getStatusIndicator()}
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200 group-hover:scale-105",
                isCompleted && isActualRaceDay ? "bg-purple-500/20 text-purple-600" : 
                isCompleted ? "bg-success/20 text-success" : 
                isActualRaceDay ? "bg-purple-500/10 text-purple-600" : "bg-primary/10 text-primary"
              )}>
                <workoutConfig.icon 
                  className="h-4 w-4" 
                  aria-hidden="true"
                />
              </div>
            </div>
            
            {/* Completion buttons */}
            {!isCompleted && onComplete && (
              <button
                onClick={handleComplete}
                onKeyDown={handleCompleteKeyDown}
                className={cn(
                  "p-2 rounded-lg focus-ring active-press transition-all duration-200",
                  isToday && isActualRaceDay
                    ? "bg-purple-500 text-white hover:bg-purple-600" 
                    : isToday 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
                aria-label={`Mark ${name} as complete`}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}

            {isCompleted && onUncomplete && (
              <button
                onClick={handleComplete}
                onKeyDown={handleCompleteKeyDown}
                className={cn(
                  "p-2 rounded-lg focus-ring active-press transition-all duration-200",
                  isActualRaceDay 
                    ? "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
                    : "bg-success/20 text-success hover:bg-success/30"
                )}
                aria-label={`Mark ${name} as incomplete`}
                title="Click to mark as incomplete"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Workout type badge and date */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge 
                className={cn(
                  "badge-enhanced text-xs px-2 py-0.5",
                  isActualRaceDay ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : workoutConfig.color,
                  !isActualRaceDay && "dark:" + workoutConfig.color
                )}
                color={isActualRaceDay ? "purple" : "primary"}
                aria-label={`Workout type: ${workoutConfig.label}`}
              >
                {workoutConfig.label}
              </Badge>
              {isActualRaceDay && (
                <Badge 
                  className="badge-enhanced text-xs px-2 py-0.5 bg-purple-200 text-purple-900 dark:bg-purple-800/30 dark:text-purple-200 animate-pulse"
                  color="purple"
                  aria-label="Race day"
                >
                  🏁 Race Day
                </Badge>
              )}
            </div>
            {scheduledDate && (
              <span 
                className="caption text-muted-foreground"
                aria-label={`Scheduled for ${format(scheduledDate, 'MMMM do')}`}
              >
                {formattedDate}
              </span>
            )}
          </div>
          
          {/* Workout name */}
          <div className="mb-3">
            <p className="body-small font-medium truncate">{name}</p>
          </div>

          {/* Enhanced description - flexible content area */}
          <div className="flex-grow flex flex-col">
            <div className="min-h-[2.5rem] mb-3">
              <p 
                className={cn(
                  "body-small text-muted-foreground line-clamp-2 transition-colors duration-200 text-pretty leading-relaxed",
                  "group-hover:text-muted-foreground/80"
                )}
                id={ariaDescribedBy}
              >
                {description}
              </p>
            </div>

            {/* Workout Structure Section - flexible content */}
            {structure && (
              <div className="space-y-2 mb-3 pt-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Workout Structure
                </h4>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {structure.split(' → ').map((segment, index, array) => (
                    <span key={index} className="inline-block">
                      {segment.trim()}
                      {index < array.length - 1 && (
                        <span className="mx-2 text-primary/60 font-medium">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Race details for race day - flexible content */}
            {isActualRaceDay && raceDetails && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground space-y-1 w-full">
                  {raceDetails.startTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Start: {raceDetails.startTime}</span>
                    </div>
                  )}
                  {raceDetails.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{raceDetails.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Spacer to push metrics to bottom */}
            <div className="flex-grow"></div>
          </div>

          {/* Metrics row - Fixed at bottom with consistent positioning */}
          {(distance || duration) && (
            <div className="mt-auto pt-3">
              <div className="grid grid-cols-2 gap-4 items-center min-h-[1.5rem]" aria-label="Workout metrics">
                {/* Left column - Distance (always positioned consistently) */}
                <div className="flex items-center justify-start">
                  {distance && (
                    <span 
                      className="body-small font-medium text-muted-foreground"
                      aria-label={`Distance: ${formatDistance(distance)} ${getDistanceUnit()}`}
                    >
                      {convertedDistance} {unitLabel}
                    </span>
                  )}
                </div>
                {/* Right column - Duration (always positioned consistently) */}
                <div className="flex items-center justify-end">
                  {duration && (
                    <span 
                      className="body-small font-medium text-muted-foreground"
                      aria-label={`Duration: ${formattedDuration}`}
                    >
                      {formattedDuration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "card-interactive p-6 group hover-lift h-full",
        "glass-effect focus-ring active-press",
        isToday && "ring-2 ring-primary/30 border-primary/40 bg-primary/5 animate-pulse-subtle",
        isActualRaceDay && isToday && "ring-2 ring-purple-500/40 border-purple-500/50 bg-purple-50/50 animate-pulse-subtle",
        isActualRaceDay && !isToday && "border-purple-500/30 bg-purple-50/20",
        isCompleted && "bg-success/10 border-success/30 hover:bg-success/15",
        isCompleted && isActualRaceDay && "bg-purple-100/50 border-purple-500/30 hover:bg-purple-100/70",
        isPast && !isCompleted && "opacity-70 hover:opacity-85",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : "article"}
      aria-label={getAriaLabel()}
      aria-describedby={ariaDescribedBy}
      aria-pressed={onClick && isCompleted ? true : undefined}
    >
      <div className="flex flex-col h-full">
        {/* Header with enhanced visual hierarchy */}
        <div className="flex items-start justify-between min-h-[4rem]">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Enhanced workout type icon */}
            <div 
              className={cn(
                "flex-shrink-0 p-3 rounded-xl transition-all duration-300 group-hover:scale-110 hover-lift",
                "shadow-soft group-hover:shadow-medium",
                isToday && "animate-glow",
                isCompleted && isActualRaceDay ? "bg-purple-500/20 text-purple-600" :
                isCompleted ? "bg-success/20 text-success" : 
                isActualRaceDay ? "bg-purple-500/15 text-purple-600" : "bg-primary/15 text-primary"
              )}
              aria-hidden="true"
            >
              <workoutConfig.icon className="h-6 w-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 
                className={cn(
                  "heading-5 mb-2 transition-colors duration-200 text-balance",
                  "group-hover:text-foreground/90",
                  isToday && isActualRaceDay && "text-purple-600 font-semibold",
                  isToday && !isActualRaceDay && "text-primary font-semibold"
                )}
              >
                {name}
              </h3>
              
              {scheduledDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={scheduledDate.toISOString()}>
                    {formattedDate}
                  </time>
                  {isToday && isActualRaceDay && (
                    <Badge 
                      className="badge-enhanced animate-bounce-gentle ml-2 bg-purple-200 text-purple-900"
                      color="purple"
                    >
                      🏁 Race Day!
                    </Badge>
                  )}
                  {isToday && !isActualRaceDay && (
                    <Badge 
                      className="badge-warning animate-bounce-gentle ml-2"
                      color="warning"
                    >
                      Today
                    </Badge>
                  )}
                  {isActualRaceDay && !isToday && (
                    <Badge 
                      className="badge-enhanced ml-2 bg-purple-100 text-purple-800"
                      color="purple"
                    >
                      🏁 Race Day
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced completion status */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <CheckCircle2 
                className={cn(
                  "h-6 w-6 animate-scale-in",
                  isActualRaceDay ? "text-purple-500" : "text-success"
                )} 
                aria-label="Completed"
              />
            ) : (
              <Circle 
                className={cn(
                  "h-6 w-6 transition-colors duration-200",
                  isToday && isActualRaceDay ? "text-purple-500" :
                  isToday ? "text-primary" : "text-muted-foreground group-hover:text-foreground/60"
                )}
                aria-label="Not completed"
              />
            )}
          </div>
        </div>

        {/* Content area that grows to fill available space */}
        <div className="flex-grow flex flex-col">
          {/* Enhanced description */}
          <div className="min-h-[3rem]">
            <p 
              className={cn(
                "body-small text-muted-foreground line-clamp-3 transition-colors duration-200 text-pretty leading-relaxed",
                "group-hover:text-muted-foreground/80"
              )}
              id={ariaDescribedBy}
            >
              {description}
            </p>
          </div>

          {/* Workout Structure Section */}
          {structure && (
            <div className="space-y-2 pt-6">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Workout Structure
              </h4>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {structure.split(' → ').map((segment, index, array) => (
                  <span key={index} className="inline-block">
                    {segment.trim()}
                    {index < array.length - 1 && (
                      <span className="mx-2 text-primary/60 font-medium">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Race details section for race day */}
          {isActualRaceDay && raceDetails && (
            <div className="pt-2">
              <div className="text-xs text-muted-foreground space-y-1 w-full">
                {raceDetails.startTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Start: {raceDetails.startTime}</span>
                  </div>
                )}
                {raceDetails.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{raceDetails.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Spacer to push metrics to bottom */}
          <div className="flex-grow"></div>
        </div>

        {/* Enhanced metrics section - Fixed at bottom */}
        {(distance || duration || pace) && (
          <div className="mt-auto pt-3">
            <div 
              className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30 group-hover:border-border/50 transition-colors duration-200 min-h-[3rem] items-center"
              role="group"
              aria-label="Workout metrics"
            >
              {distance && (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isActualRaceDay ? "bg-purple-100/50 group-hover:bg-purple-200/50" : "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    <MapPin 
                      className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        isActualRaceDay ? "text-purple-600 group-hover:text-purple-700" : "text-muted-foreground group-hover:text-primary"
                      )} 
                      aria-hidden="true" 
                    />
                  </div>
                  <span 
                    className="body-small font-medium transition-colors duration-200 group-hover:text-foreground"
                    aria-label={`Distance: ${convertedDistance} ${unitLabel}`}
                  >
                    {convertedDistance} {unitLabel}
                  </span>
                </div>
              )}
              
              {(duration || pace) && (
                <div className="flex items-center gap-2 justify-end">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isActualRaceDay ? "bg-purple-100/50 group-hover:bg-purple-200/50" : "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    {duration ? (
                      <Timer 
                        className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          isActualRaceDay ? "text-purple-600 group-hover:text-purple-700" : "text-muted-foreground group-hover:text-primary"
                        )} 
                        aria-hidden="true" 
                      />
                    ) : (
                      <Clock 
                        className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          isActualRaceDay ? "text-purple-600 group-hover:text-purple-700" : "text-muted-foreground group-hover:text-primary"
                        )} 
                        aria-hidden="true" 
                      />
                    )}
                  </div>
                  <span 
                    className="body-small font-medium transition-colors duration-200 group-hover:text-foreground"
                    aria-label={duration ? `Duration: ${formattedDuration}` : `Target pace: ${convertedPace}`}
                  >
                    {duration ? formattedDuration : convertedPace}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced action button for incomplete workouts */}
        {!isCompleted && onComplete && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <button
              onClick={handleComplete}
              onKeyDown={handleCompleteKeyDown}
              className={cn(
                "w-full focus-ring active-press transition-all duration-200",
                isToday && isActualRaceDay
                  ? "bg-purple-500 hover:bg-purple-600 text-white border-purple-500 hover:border-purple-600"
                  : isToday 
                  ? "btn-primary-enhanced" 
                  : "btn-secondary hover:btn-primary-enhanced"
              )}
              aria-label={`Mark ${name} as complete`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isActualRaceDay ? 'Complete Race' : 'Mark Complete'}
            </button>
          </div>
        )}

        {/* Action button for completed workouts */}
        {isCompleted && onUncomplete && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <button
              onClick={handleComplete}
              onKeyDown={handleCompleteKeyDown}
              className={cn(
                "w-full focus-ring active-press transition-all duration-200",
                isActualRaceDay
                  ? "btn-secondary hover:bg-purple-100/50 text-purple-600 hover:text-purple-700 border-purple-300/50"
                  : "btn-secondary hover:bg-success/10 text-success hover:text-success border-success/30"
              )}
              aria-label={`Mark ${name} as incomplete`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Incomplete
            </button>
          </div>
        )}

        {/* Static completion indicator when no uncomplete action available */}
        {isCompleted && !onUncomplete && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <div className={cn(
              "flex items-center justify-center gap-2",
              isActualRaceDay ? "text-purple-600" : "text-success"
            )}>
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                {isActualRaceDay ? 'Race Completed!' : 'Completed'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}); 