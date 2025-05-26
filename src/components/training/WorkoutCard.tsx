'use client';

import React from 'react';
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
  Activity
} from 'lucide-react';
import { WorkoutType } from '@/generated/prisma';
import { format } from 'date-fns';

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
  
  // Status and interaction
  isCompleted?: boolean;
  isToday?: boolean;
  isUpcoming?: boolean;
  isPast?: boolean;
  
  // Styling
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  
  // Interaction
  onClick?: () => void;
  onComplete?: () => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const workoutTypeConfig = {
  [WorkoutType.TEMPO_RUN]: {
    label: 'Tempo',
    icon: Target,
    color: 'bg-orange-500',
    badgeColor: 'orange-500',
    lightColor: 'bg-orange-100 text-orange-800',
    darkColor: 'bg-orange-900/30 text-orange-300',
    description: 'Tempo run workout for building lactate threshold'
  },
  [WorkoutType.INTERVAL_800M]: {
    label: 'Intervals',
    icon: Zap,
    color: 'bg-red-500',
    badgeColor: 'red-500',
    lightColor: 'bg-red-100 text-red-800',
    darkColor: 'bg-red-900/30 text-red-300',
    description: '800 meter interval training for speed development'
  },
  [WorkoutType.LONG_RUN]: {
    label: 'Long Run',
    icon: Activity,
    color: 'bg-blue-500',
    badgeColor: 'blue-500',
    lightColor: 'bg-blue-100 text-blue-800',
    darkColor: 'bg-blue-900/30 text-blue-300',
    description: 'Long distance run for endurance building'
  },
  [WorkoutType.EASY_RUN]: {
    label: 'Easy',
    icon: Circle,
    color: 'bg-green-500',
    badgeColor: 'green-500',
    lightColor: 'bg-green-100 text-green-800',
    darkColor: 'bg-green-900/30 text-green-300',
    description: 'Easy pace run for recovery and base building'
  },
  [WorkoutType.RECOVERY_RUN]: {
    label: 'Recovery',
    icon: Circle,
    color: 'bg-gray-500',
    badgeColor: 'gray-500',
    lightColor: 'bg-gray-100 text-gray-800',
    darkColor: 'bg-gray-900/30 text-gray-300',
    description: 'Recovery run for active rest and muscle recovery'
  },
};

export function WorkoutCard({
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
  isCompleted = false,
  isToday = false,
  isUpcoming = false,
  isPast = false,
  variant = 'default',
  className,
  onClick,
  onComplete,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: WorkoutCardProps) {
  const config = workoutTypeConfig[type];
  const Icon = config.icon;

  const formatDistance = (dist: number) => {
    return dist % 1 === 0 ? dist.toString() : dist.toFixed(1);
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
    if (isCompleted) return 'Completed';
    if (isToday) return 'Scheduled for today';
    if (isPast && !isCompleted) return 'Missed workout';
    if (isUpcoming) return 'Upcoming workout';
    return 'Scheduled workout';
  };

  // Generate comprehensive aria-label
  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    
    const parts = [
      name,
      config.description,
      `Week ${week}`,
      scheduledDate ? format(scheduledDate, 'EEEE, MMMM do') : '',
      distance ? `${formatDistance(distance)} kilometers` : '',
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
          className="h-4 w-4 text-green-500" 
          aria-label={statusText}
          role="img"
        />
      );
    }
    if (isToday) {
      return (
        <div 
          className={cn("h-3 w-3 rounded-full", config.color)} 
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
      onClick?.();
    }
  };

  const handleCompleteKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onComplete?.();
    }
  };

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          "p-3 cursor-pointer transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "border border-border/50",
          isToday && "ring-2 ring-primary/20 border-primary/30",
          isCompleted && "bg-muted/30",
          isPast && !isCompleted && "opacity-60",
          className
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : -1}
        role={onClick ? "button" : "article"}
        aria-label={getAriaLabel()}
        aria-describedby={ariaDescribedBy}
        aria-pressed={onClick && isCompleted ? true : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIndicator()}
            <Icon 
              className="h-4 w-4 text-muted-foreground" 
              aria-hidden="true"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge 
                color={config.badgeColor}
                className={cn(
                  "text-xs px-2 py-0.5",
                  "dark:bg-muted/50 dark:text-muted-foreground",
                  config.lightColor,
                  "dark:" + config.darkColor
                )}
                aria-label={`Workout type: ${config.label}`}
              >
                {config.label}
              </Badge>
              {scheduledDate && (
                <span 
                  className="text-xs text-muted-foreground"
                  aria-label={`Scheduled for ${format(scheduledDate, 'MMMM do')}`}
                >
                  {format(scheduledDate, 'MMM d')}
                </span>
              )}
            </div>
            <p className="text-sm font-medium truncate mt-1">{name}</p>
          </div>

          {(distance || duration) && (
            <div className="text-right" aria-label="Workout metrics">
              {distance && (
                <div 
                  className="text-sm font-medium"
                  aria-label={`Distance: ${formatDistance(distance)} kilometers`}
                >
                  {formatDistance(distance)}km
                </div>
              )}
              {duration && (
                <div 
                  className="text-xs text-muted-foreground"
                  aria-label={`Duration: ${formatDuration(duration)}`}
                >
                  {formatDuration(duration)}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "border border-border/50 bg-card/50 backdrop-blur-sm",
        isToday && "ring-2 ring-primary/20 border-primary/30 bg-primary/5",
        isCompleted && "bg-muted/30 border-green-200 dark:border-green-800",
        isPast && !isCompleted && "opacity-60",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : "article"}
      aria-label={getAriaLabel()}
      aria-describedby={ariaDescribedBy}
      aria-pressed={onClick && isCompleted ? true : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          <Badge 
            color={config.badgeColor}
            className={cn(
              "text-xs px-2 py-1",
              config.lightColor,
              "dark:" + config.darkColor
            )}
            aria-label={`Workout type: ${config.label}`}
          >
            <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
            {config.label}
          </Badge>
        </div>
        
        <div className="text-right">
          <div 
            className="text-xs text-muted-foreground"
            aria-label={`Training week ${week}`}
          >
            Week {week}
          </div>
          {scheduledDate && (
            <div 
              className="text-xs text-muted-foreground"
              aria-label={`Scheduled for ${format(scheduledDate, 'EEEE, MMMM do')}`}
            >
              {format(scheduledDate, 'EEE, MMM d')}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm leading-tight">{name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Metrics */}
      {(distance || duration || pace) && (
        <div 
          className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30"
          role="group"
          aria-label="Workout metrics"
        >
          {distance && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span 
                className="text-sm font-medium"
                aria-label={`Distance: ${formatDistance(distance)} kilometers`}
              >
                {formatDistance(distance)}km
              </span>
            </div>
          )}
          
          {duration && (
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span 
                className="text-sm font-medium"
                aria-label={`Duration: ${formatDuration(duration)}`}
              >
                {formatDuration(duration)}
              </span>
            </div>
          )}
          
          {pace && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span 
                className="text-sm font-medium"
                aria-label={`Target pace: ${pace}`}
              >
                {pace}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons for today's workout */}
      {isToday && !isCompleted && onComplete && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            onKeyDown={handleCompleteKeyDown}
            className="w-full text-sm font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors rounded px-2 py-1"
            aria-label={`Mark ${name} as complete`}
          >
            Mark Complete
          </button>
        </div>
      )}
    </Card>
  );
} 