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

// Memoized workout type configuration
const WORKOUT_TYPE_CONFIG = {
  [WorkoutType.EASY_RUN]: {
    icon: Activity,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: 'Easy Run'
  },
  [WorkoutType.TEMPO_RUN]: {
    icon: Zap,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    label: 'Tempo Run'
  },
  [WorkoutType.INTERVAL_800M]: {
    icon: Timer,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: '800m Intervals'
  },
  [WorkoutType.LONG_RUN]: {
    icon: Target,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    label: 'Long Run'
  },
  [WorkoutType.RECOVERY_RUN]: {
    icon: Circle,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    label: 'Recovery Run'
  },
  [WorkoutType.MARATHON_RACE]: {
    icon: Trophy,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    label: 'Marathon Race'
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
            isActualRaceDay ? "text-yellow-500" : "text-green-500"
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
            isActualRaceDay ? "bg-yellow-500 animate-pulse" : workoutConfig.color
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
          "card-enhanced p-4 cursor-pointer group hover-lift",
          "focus-ring active-press",
          isToday && "ring-2 ring-primary/20 border-primary/30 animate-pulse-subtle",
          isActualRaceDay && isToday && "ring-2 ring-yellow-500/30 border-yellow-500/40 bg-yellow-50/50 animate-pulse-subtle",
          isActualRaceDay && !isToday && "border-yellow-500/20 bg-yellow-50/20",
          isCompleted && "bg-success/10 border-success/30",
          isCompleted && isActualRaceDay && "bg-yellow-100/50 border-yellow-500/30",
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
        <div className="space-y-3">
          {/* Header row with status, icon, and completion button */}
          <div className="flex items-center justify-between min-h-[2.5rem]">
            <div className="flex items-center gap-2">
              {getStatusIndicator()}
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200 group-hover:scale-105",
                isCompleted && isActualRaceDay ? "bg-yellow-500/20 text-yellow-600" : 
                isCompleted ? "bg-success/20 text-success" : 
                isActualRaceDay ? "bg-yellow-500/10 text-yellow-600" : "bg-primary/10 text-primary"
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
                    ? "bg-yellow-500 text-white hover:bg-yellow-600" 
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
                    ? "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"
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
          <div className="flex items-center justify-between min-h-[1.5rem]">
            <div className="flex items-center gap-2">
              <Badge 
                className={cn(
                  "badge-enhanced text-xs px-2 py-0.5",
                  isActualRaceDay ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" : workoutConfig.color,
                  !isActualRaceDay && "dark:" + workoutConfig.color
                )}
                color={isActualRaceDay ? "yellow" : "primary"}
                aria-label={`Workout type: ${workoutConfig.label}`}
              >
                {workoutConfig.label}
              </Badge>
              {isActualRaceDay && (
                <Badge 
                  className="badge-enhanced text-xs px-2 py-0.5 bg-yellow-200 text-yellow-900 dark:bg-yellow-800/30 dark:text-yellow-200 animate-pulse"
                  color="yellow"
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
          <div className="min-h-[1.25rem]">
            <p className="body-small font-medium truncate">{name}</p>
          </div>

          {/* Enhanced description */}
          <div className="min-h-[2.5rem]">
            <p 
              className={cn(
                "body-small text-muted-foreground line-clamp-2 transition-colors duration-200 text-pretty",
                "group-hover:text-muted-foreground/80"
              )}
              id={ariaDescribedBy}
            >
              {description}
            </p>
          </div>

          {/* Workout Structure Section */}
          <div className="min-h-[4rem]">
            {structure && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Workout Structure
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {structure}
                </p>
              </div>
            )}
          </div>

          {/* Race details for race day */}
          <div className="min-h-[3rem]">
            {isActualRaceDay && raceDetails && (
              <div className="text-xs text-muted-foreground space-y-1">
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
            )}
          </div>

          {/* Metrics row */}
          <div className="min-h-[1.5rem]">
            {(distance || duration) && (
              <div className="flex items-center justify-between text-sm" aria-label="Workout metrics">
                {distance && (
                  <div 
                    className="body-small font-medium text-muted-foreground"
                    aria-label={`Distance: ${formatDistance(distance)} ${getDistanceUnit()}`}
                  >
                    {convertedDistance} {unitLabel}
                  </div>
                )}
                {duration && (
                  <div 
                    className="caption text-muted-foreground"
                    aria-label={`Duration: ${formattedDuration}`}
                  >
                    {formattedDuration}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "card-interactive p-6 group hover-lift",
        "glass-effect focus-ring active-press",
        isToday && "ring-2 ring-primary/30 border-primary/40 bg-primary/5 animate-pulse-subtle",
        isActualRaceDay && isToday && "ring-2 ring-yellow-500/40 border-yellow-500/50 bg-yellow-50/50 animate-pulse-subtle",
        isActualRaceDay && !isToday && "border-yellow-500/30 bg-yellow-50/20",
        isCompleted && "bg-success/10 border-success/30 hover:bg-success/15",
        isCompleted && isActualRaceDay && "bg-yellow-100/50 border-yellow-500/30 hover:bg-yellow-100/70",
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
      <div className="space-y-4">
        {/* Header with enhanced visual hierarchy */}
        <div className="flex items-start justify-between min-h-[4rem]">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Enhanced workout type icon */}
            <div 
              className={cn(
                "flex-shrink-0 p-3 rounded-xl transition-all duration-300 group-hover:scale-110 hover-lift",
                "shadow-soft group-hover:shadow-medium",
                isToday && "animate-glow",
                isCompleted && isActualRaceDay ? "bg-yellow-500/20 text-yellow-600" :
                isCompleted ? "bg-success/20 text-success" : 
                isActualRaceDay ? "bg-yellow-500/15 text-yellow-600" : "bg-primary/15 text-primary"
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
                  isToday && isActualRaceDay && "text-yellow-600 font-semibold",
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
                      className="badge-enhanced animate-bounce-gentle ml-2 bg-yellow-200 text-yellow-900"
                      color="yellow"
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
                      className="badge-enhanced ml-2 bg-yellow-100 text-yellow-800"
                      color="yellow"
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
                  isActualRaceDay ? "text-yellow-500" : "text-success"
                )} 
                aria-label="Completed"
              />
            ) : (
              <Circle 
                className={cn(
                  "h-6 w-6 transition-colors duration-200",
                  isToday && isActualRaceDay ? "text-yellow-500" :
                  isToday ? "text-primary" : "text-muted-foreground group-hover:text-foreground/60"
                )}
                aria-label="Not completed"
              />
            )}
          </div>
        </div>

        {/* Enhanced description */}
        <div className="min-h-[3rem]">
          <p 
            className={cn(
              "body-small text-muted-foreground line-clamp-2 transition-colors duration-200 text-pretty",
              "group-hover:text-muted-foreground/80"
            )}
            id={ariaDescribedBy}
          >
            {description}
          </p>
        </div>

        {/* Workout Structure Section */}
        <div className="min-h-[5rem]">
          {structure && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Workout Structure
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {structure}
              </p>
            </div>
          )}
        </div>

        {/* Race details section for race day */}
        <div className="min-h-[4rem]">
          {isActualRaceDay && raceDetails && (
            <div className="p-3 rounded-lg bg-yellow-50/50 border border-yellow-200/50">
              <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Race Details
              </h4>
              <div className="space-y-1 text-sm text-yellow-700">
                {raceDetails.startTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Start Time: {raceDetails.startTime}</span>
                  </div>
                )}
                {raceDetails.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>Location: {raceDetails.location}</span>
                  </div>
                )}
                {raceDetails.instructions && (
                  <div className="mt-2 text-xs text-yellow-600">
                    {raceDetails.instructions}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced metrics section */}
        <div className="min-h-[3rem]">
          {(distance || duration || pace) && (
            <div 
              className="flex items-center gap-4 pt-4 border-t border-border/30 group-hover:border-border/50 transition-colors duration-200"
              role="group"
              aria-label="Workout metrics"
            >
              {distance && (
                <div className="flex items-center gap-2 group/metric hover-scale">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isActualRaceDay ? "bg-yellow-100/50 group-hover/metric:bg-yellow-200/50" : "bg-muted/50 group-hover/metric:bg-primary/10"
                  )}>
                    <MapPin 
                      className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        isActualRaceDay ? "text-yellow-600 group-hover/metric:text-yellow-700" : "text-muted-foreground group-hover/metric:text-primary"
                      )} 
                      aria-hidden="true" 
                    />
                  </div>
                  <span 
                    className="body-small font-medium transition-colors duration-200 group-hover/metric:text-foreground"
                    aria-label={`Distance: ${convertedDistance} ${unitLabel}`}
                  >
                    {convertedDistance} {unitLabel}
                  </span>
                </div>
              )}
              
              {duration && (
                <div className="flex items-center gap-2 group/metric hover-scale">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isActualRaceDay ? "bg-yellow-100/50 group-hover/metric:bg-yellow-200/50" : "bg-muted/50 group-hover/metric:bg-primary/10"
                  )}>
                    <Timer 
                      className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        isActualRaceDay ? "text-yellow-600 group-hover/metric:text-yellow-700" : "text-muted-foreground group-hover/metric:text-primary"
                      )} 
                      aria-hidden="true" 
                    />
                  </div>
                  <span 
                    className="body-small font-medium transition-colors duration-200 group-hover/metric:text-foreground"
                    aria-label={`Duration: ${formattedDuration}`}
                  >
                    {formattedDuration}
                  </span>
                </div>
              )}
              
              {pace && (
                <div className="flex items-center gap-2 group/metric hover-scale">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isActualRaceDay ? "bg-yellow-100/50 group-hover/metric:bg-yellow-200/50" : "bg-muted/50 group-hover/metric:bg-primary/10"
                  )}>
                    <Clock 
                      className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        isActualRaceDay ? "text-yellow-600 group-hover/metric:text-yellow-700" : "text-muted-foreground group-hover/metric:text-primary"
                      )} 
                      aria-hidden="true" 
                    />
                  </div>
                  <span 
                    className="body-small font-medium transition-colors duration-200 group-hover/metric:text-foreground"
                    aria-label={`Target pace: ${convertedPace}`}
                  >
                    {convertedPace}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced action button for incomplete workouts */}
        {!isCompleted && onComplete && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <button
              onClick={handleComplete}
              onKeyDown={handleCompleteKeyDown}
              className={cn(
                "w-full focus-ring active-press transition-all duration-200",
                isToday && isActualRaceDay
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600"
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
                  ? "btn-secondary hover:bg-yellow-100/50 text-yellow-600 hover:text-yellow-700 border-yellow-300/50"
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
              isActualRaceDay ? "text-yellow-600" : "text-success"
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