'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  Heart,
  Play,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { WorkoutType } from '@/generated/prisma';
import { format } from 'date-fns';
import { useUserSetting } from '@/hooks/useUserSetting';
import { WorkoutCardProps } from './WorkoutCard';
import { CustomButton } from '@/components/CustomButton';

// Define distance unit constants to avoid runtime enum issues
const DISTANCE_UNITS = {
  KILOMETERS: 'KILOMETERS',
  MILES: 'MILES'
} as const;

type DistanceUnitType = typeof DISTANCE_UNITS[keyof typeof DISTANCE_UNITS];

interface WorkoutDetailModalProps {
  workout: WorkoutCardProps;
  onComplete?: () => void;
  onUncomplete?: () => void;
  close: () => void;
}

const workoutTypeConfig = {
  [WorkoutType.TEMPO_RUN]: {
    label: 'Tempo Run',
    icon: Target,
    color: 'bg-orange-500',
    badgeColor: 'orange-500',
    lightColor: 'bg-orange-100 text-orange-800',
    darkColor: 'bg-orange-900/30 text-orange-300',
    description: 'Comfortably hard pace that you could sustain for about an hour in a race',
    structure: 'Warm-up → Tempo segments → Cool-down',
    benefits: ['Improves lactate threshold', 'Builds aerobic power', 'Enhances race pace endurance']
  },
  [WorkoutType.INTERVAL_800M]: {
    label: 'Intervals',
    icon: Zap,
    color: 'bg-red-500',
    badgeColor: 'red-500',
    lightColor: 'bg-red-100 text-red-800',
    darkColor: 'bg-red-900/30 text-red-300',
    description: 'High-intensity repeats with recovery periods between efforts',
    structure: 'Warm-up → Intervals with recovery → Cool-down',
    benefits: ['Increases VO2 max', 'Improves speed', 'Enhances neuromuscular power']
  },
  [WorkoutType.LONG_RUN]: {
    label: 'Long Run',
    icon: Activity,
    color: 'bg-blue-500',
    badgeColor: 'blue-500',
    lightColor: 'bg-blue-100 text-blue-800',
    darkColor: 'bg-blue-900/30 text-blue-300',
    description: 'Extended distance run at a conversational pace',
    structure: 'Gradual build → Steady effort → Optional progression',
    benefits: ['Builds aerobic base', 'Improves fat burning', 'Develops mental toughness']
  },
  [WorkoutType.EASY_RUN]: {
    label: 'Easy Run',
    icon: Circle,
    color: 'bg-green-500',
    badgeColor: 'green-500',
    lightColor: 'bg-green-100 text-green-800',
    darkColor: 'bg-green-900/30 text-green-300',
    description: 'Relaxed pace where you can easily hold a conversation',
    structure: 'Consistent easy effort throughout',
    benefits: ['Promotes recovery', 'Builds aerobic base', 'Improves running economy']
  },
  [WorkoutType.RECOVERY_RUN]: {
    label: 'Recovery',
    icon: RotateCcw,
    color: 'bg-gray-500',
    badgeColor: 'gray-500',
    lightColor: 'bg-gray-100 text-gray-800',
    darkColor: 'bg-gray-900/30 text-gray-300',
    description: 'Very easy pace focused on active recovery',
    structure: 'Short, gentle effort with focus on form',
    benefits: ['Enhances recovery', 'Maintains fitness', 'Improves blood flow']
  },
  [WorkoutType.MARATHON_RACE]: {
    label: 'Marathon Race',
    icon: Trophy,
    color: 'bg-purple-500',
    badgeColor: 'purple-500',
    lightColor: 'bg-purple-100 text-purple-800',
    darkColor: 'bg-purple-900/30 text-purple-300',
    description: 'The main event - 26.2 miles of sustained effort',
    structure: 'Warm-up → Race pace → Final push',
    benefits: ['Tests all training adaptations', 'Ultimate endurance challenge', 'Peak performance demonstration']
  },
};

export const WorkoutDetailModal = React.memo<WorkoutDetailModalProps>(function WorkoutDetailModal({ 
  workout, 
  onComplete, 
  onUncomplete, 
  close 
}: WorkoutDetailModalProps) {
  const config = workoutTypeConfig[workout.type];
  const Icon = config.icon;

  // Get user's distance unit preference
  const { value: distanceUnitValue } = useUserSetting('marathonDistanceUnit');
  const distanceUnit = (distanceUnitValue as DistanceUnitType) || DISTANCE_UNITS.MILES;
  
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

  const handleComplete = () => {
    onComplete?.();
    close();
  };

  const handleUncomplete = () => {
    onUncomplete?.();
    close();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex-shrink-0 p-4 rounded-xl",
          workout.isCompleted ? "bg-success/20 text-success" : "bg-primary/15 text-primary"
        )}>
          <Icon className="h-8 w-8" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Badge 
              className={cn(
                "badge-enhanced",
                config.lightColor,
                "dark:" + config.darkColor
              )}
              color={config.badgeColor}
            >
              {config.label}
            </Badge>
            {workout.scheduledDate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(workout.scheduledDate, 'EEE, MMM d, yyyy')}
              </div>
            )}
            {workout.isCompleted && (
              <Badge color="green" className="badge-success">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          
          <h2 className="heading-4 mb-2">{workout.name}</h2>
          <p className="body-small text-muted-foreground">{workout.description}</p>
        </div>
      </div>

      {/* Workout Metrics */}
      {(workout.distance || workout.duration || workout.pace) && (
        <Card className="p-4">
          <h3 className="heading-6 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Workout Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {workout.distance && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{formatDistance(workout.distance)} {getDistanceUnit()}</div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
              </div>
            )}
            
            {workout.duration && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Timer className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{formatDuration(workout.duration)}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
            )}
            
            {workout.pace && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{workout.pace}</div>
                  <div className="text-sm text-muted-foreground">Target Pace</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Workout Details */}
      <Card className="p-4">
        <h3 className="heading-6 mb-3 flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Workout Details
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Purpose</h4>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Structure</h4>
            <p className="text-sm text-muted-foreground">{config.structure}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Benefits</h4>
            <ul className="space-y-1">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Week Context */}
      <Card className="p-4">
        <h3 className="heading-6 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Training Context
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Week</div>
            <div className="text-muted-foreground">Week {workout.week} of 14</div>
          </div>
          {workout.day && (
            <div>
              <div className="font-medium">Day</div>
              <div className="text-muted-foreground">Day {workout.day}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        {!workout.isCompleted && onComplete && (
          <CustomButton
            onClick={handleComplete}
            leftIcon={CheckCircle2}
            className="flex-1"
          >
            Mark as Complete
          </CustomButton>
        )}
        
        {workout.isCompleted && onUncomplete && (
          <CustomButton
            onClick={handleUncomplete}
            leftIcon={RotateCcw}
            variant="light"
            className="flex-1"
          >
            Mark as Incomplete
          </CustomButton>
        )}
        
        <CustomButton
          onClick={close}
          variant="outline"
          className="flex-1"
        >
          Close
        </CustomButton>
      </div>
    </div>
  );
}); 