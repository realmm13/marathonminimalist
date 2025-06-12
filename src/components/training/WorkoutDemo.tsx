'use client';

import React, { useState } from 'react';
import { WorkoutGrid } from './WorkoutGrid';
import { WorkoutCardProps } from './WorkoutCard';
import { WorkoutType, DistanceUnit } from '@/generated/prisma';
import { addDays, addWeeks } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useUserSetting } from '@/hooks/useUserSetting';

// Fallback enum for DistanceUnit in case it's undefined (e.g., on landing page)
const FALLBACK_DISTANCE_UNIT = {
  KILOMETERS: 'KILOMETERS',
  MILES: 'MILES',
} as const;

// Helper functions for unit conversion
const convertDistance = (kmValue: number, unit: DistanceUnit): number => {
  return unit === DistanceUnit.MILES ? kmValue * 0.621371 : kmValue;
};

const convertPace = (kmPace: string, unit: DistanceUnit): string => {
  if (unit === DistanceUnit.MILES) {
    // Convert km pace to mile pace (multiply by 1.609344)
    const paceParts = kmPace.split(':');
    if (paceParts.length !== 2 || !paceParts[0] || !paceParts[1]) return kmPace; // Return original if format is unexpected
    
    const minutes = parseInt(paceParts[0], 10);
    const seconds = parseInt(paceParts[1].replace('/km', ''), 10);
    
    if (isNaN(minutes) || isNaN(seconds)) return kmPace; // Return original if parsing fails
    
    const totalSeconds = minutes * 60 + seconds;
    const mileSeconds = totalSeconds * 1.609344;
    const mileMinutes = Math.floor(mileSeconds / 60);
    const remainingSeconds = Math.round(mileSeconds % 60);
    return `${mileMinutes}:${remainingSeconds.toString().padStart(2, '0')}/mi`;
  }
  return kmPace;
};

// Sample workout data for a 14-week marathon training plan
const generateSampleWorkouts = (distanceUnit: DistanceUnit | keyof typeof FALLBACK_DISTANCE_UNIT): WorkoutCardProps[] => {
  const startDate = new Date('2024-01-01');
  const workouts: WorkoutCardProps[] = [];

  // Week 1-2: Base building
  for (let week = 1; week <= 2; week++) {
    const weekStart = addWeeks(startDate, week - 1);
    
    workouts.push(
      {
        name: 'Easy Run',
        description: 'Comfortable pace run to build aerobic base',
        type: WorkoutType.EASY_RUN,
        week,
        day: 1,
        scheduledDate: addDays(weekStart, 0),
        distance: convertDistance(5, distanceUnit),
        duration: 35,
        pace: convertPace('6:30/km', distanceUnit),
        isCompleted: week === 1,
      },
      {
        name: 'Tempo Run',
        description: '20 minutes at marathon pace after warm-up',
        type: WorkoutType.TEMPO_RUN,
        week,
        day: 3,
        scheduledDate: addDays(weekStart, 2),
        distance: convertDistance(8, distanceUnit),
        duration: 50,
        pace: convertPace('5:45/km', distanceUnit),
        isCompleted: week === 1,
      },
      {
        name: 'Long Run',
        description: `Easy pace with ${distanceUnit === DistanceUnit.MILES ? '2 miles' : '3.2 km'} at marathon pace`,
        type: WorkoutType.LONG_RUN,
        week,
        day: 6,
        scheduledDate: addDays(weekStart, 5),
        distance: convertDistance(week === 1 ? 12 : 14, distanceUnit),
        duration: week === 1 ? 75 : 85,
        pace: convertPace('6:00/km', distanceUnit),
        isCompleted: week === 1,
      }
    );
  }

  // Week 3-6: Build phase
  for (let week = 3; week <= 6; week++) {
    const weekStart = addWeeks(startDate, week - 1);
    
    workouts.push(
      {
        name: 'Easy Run',
        description: 'Recovery pace to maintain aerobic fitness',
        type: WorkoutType.EASY_RUN,
        week,
        day: 1,
        scheduledDate: addDays(weekStart, 0),
        distance: convertDistance(6, distanceUnit),
        duration: 40,
        pace: convertPace('6:30/km', distanceUnit),
        isCompleted: false,
      },
      {
        name: '800m Intervals',
        description: '6 x 800m at 5K pace with 400m recovery',
        type: WorkoutType.INTERVAL_800M,
        week,
        day: 3,
        scheduledDate: addDays(weekStart, 2),
        distance: convertDistance(10, distanceUnit),
        duration: 55,
        pace: convertPace('4:45/km', distanceUnit),
        isCompleted: false,
      },
      {
        name: 'Tempo Run',
        description: '30 minutes at marathon pace',
        type: WorkoutType.TEMPO_RUN,
        week,
        day: 5,
        scheduledDate: addDays(weekStart, 4),
        distance: convertDistance(10, distanceUnit),
        duration: 60,
        pace: convertPace('5:45/km', distanceUnit),
        isCompleted: false,
      },
      {
        name: 'Long Run',
        description: `Easy pace with ${distanceUnit === DistanceUnit.MILES ? `${Math.min(week - 1, 4)} miles` : `${Math.round(Math.min(week - 1, 4) * 1.609)} km`} at marathon pace`,
        type: WorkoutType.LONG_RUN,
        week,
        day: 7,
        scheduledDate: addDays(weekStart, 6),
        distance: convertDistance(14 + (week - 3) * 2, distanceUnit),
        duration: 90 + (week - 3) * 10,
        pace: convertPace('6:00/km', distanceUnit),
        isCompleted: false,
      }
    );
  }

  // Week 7-10: Peak phase
  for (let week = 7; week <= 10; week++) {
    const weekStart = addWeeks(startDate, week - 1);
    
    workouts.push(
      {
        name: 'Easy Run',
        description: 'Active recovery between hard sessions',
        type: WorkoutType.EASY_RUN,
        week,
        day: 1,
        scheduledDate: addDays(weekStart, 0),
        distance: 7,
        duration: 45,
        pace: '6:30/km',
        isCompleted: false,
      },
      {
        name: '800m Intervals',
        description: `${6 + (week - 7)} x 800m at 5K pace with 400m recovery`,
        type: WorkoutType.INTERVAL_800M,
        week,
        day: 2,
        scheduledDate: addDays(weekStart, 1),
        distance: 12,
        duration: 65,
        pace: '4:45/km',
        isCompleted: false,
      },
      {
        name: 'Recovery Run',
        description: 'Very easy pace for active recovery',
        type: WorkoutType.RECOVERY_RUN,
        week,
        day: 4,
        scheduledDate: addDays(weekStart, 3),
        distance: 5,
        duration: 35,
        pace: '7:00/km',
        isCompleted: false,
      },
      {
        name: 'Tempo Run',
        description: '40 minutes at marathon pace',
        type: WorkoutType.TEMPO_RUN,
        week,
        day: 5,
        scheduledDate: addDays(weekStart, 4),
        distance: 12,
        duration: 70,
        pace: '5:45/km',
        isCompleted: false,
      },
      {
        name: 'Long Run',
        description: `Peak long run with ${Math.min(week - 5, 6)} miles at marathon pace`,
        type: WorkoutType.LONG_RUN,
        week,
        day: 7,
        scheduledDate: addDays(weekStart, 6),
        distance: 20 + (week - 7),
        duration: 120 + (week - 7) * 8,
        pace: '6:00/km',
        isCompleted: false,
      }
    );
  }

  // Week 11-14: Taper phase
  for (let week = 11; week <= 14; week++) {
    const weekStart = addWeeks(startDate, week - 1);
    const isRaceWeek = week === 14;
    
    if (isRaceWeek) {
      workouts.push(
        {
          name: 'Easy Shakeout',
          description: 'Light 20-minute jog to stay loose',
          type: WorkoutType.EASY_RUN,
          week,
          day: 1,
          scheduledDate: addDays(weekStart, 0),
          distance: 3,
          duration: 20,
          pace: '6:30/km',
          isCompleted: false,
        },
        {
          name: 'Marathon Race',
          description: 'Race day! Execute your race plan and enjoy the experience',
          type: WorkoutType.LONG_RUN,
          week,
          day: 7,
          scheduledDate: addDays(weekStart, 6),
          distance: 42.2,
          duration: 240,
          pace: '5:45/km',
          isCompleted: false,
        }
      );
    } else {
      workouts.push(
        {
          name: 'Easy Run',
          description: 'Maintain fitness while reducing fatigue',
          type: WorkoutType.EASY_RUN,
          week,
          day: 1,
          scheduledDate: addDays(weekStart, 0),
          distance: 5,
          duration: 35,
          pace: '6:30/km',
          isCompleted: false,
        },
        {
          name: 'Tempo Run',
          description: `${25 - (week - 11) * 5} minutes at marathon pace`,
          type: WorkoutType.TEMPO_RUN,
          week,
          day: 3,
          scheduledDate: addDays(weekStart, 2),
          distance: 8 - (week - 11),
          duration: 50 - (week - 11) * 5,
          pace: '5:45/km',
          isCompleted: false,
        },
        {
          name: 'Long Run',
          description: 'Reduced volume to maintain endurance',
          type: WorkoutType.LONG_RUN,
          week,
          day: 6,
          scheduledDate: addDays(weekStart, 5),
          distance: 18 - (week - 11) * 2,
          duration: 110 - (week - 11) * 15,
          pace: '6:00/km',
          isCompleted: false,
        }
      );
    }
  }

  return workouts;
};

export function WorkoutDemo() {
  const [variant, setVariant] = useState<'calendar' | 'list' | 'compact'>('calendar');
  
  // Get user's distance unit preference
  const { value: distanceUnitValue } = useUserSetting('marathonDistanceUnit');
  // Use fallback if DistanceUnit is undefined
  const distanceUnit: DistanceUnit | keyof typeof FALLBACK_DISTANCE_UNIT = (distanceUnitValue as DistanceUnit) || (DistanceUnit?.MILES ?? FALLBACK_DISTANCE_UNIT.MILES);
  
  const workouts = generateSampleWorkouts(distanceUnit);

  const handleWorkoutClick = (workout: WorkoutCardProps) => {
    console.log('Workout clicked:', workout);
  };

  const handleWorkoutComplete = (workout: WorkoutCardProps) => {
    console.log('Workout completed:', workout);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marathon Training Plan</h1>
          <p className="text-muted-foreground mt-1">
            14-week progressive training plan for sub-4:00 marathon
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge color="blue-500" size="lg">
            Week 2 of 14
          </Badge>
          
          <SegmentedControl
            value={variant}
            onChange={(value: string) => setVariant(value as 'calendar' | 'list' | 'compact')}
            options={[
              { label: 'Calendar', value: 'calendar' },
              { label: 'List', value: 'list' },
              { label: 'Compact', value: 'compact' },
            ]}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">52</div>
          <div className="text-sm text-muted-foreground">Total Workouts</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">8</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">320km</div>
          <div className="text-sm text-muted-foreground">Total Distance</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">4:00:00</div>
          <div className="text-sm text-muted-foreground">Goal Time</div>
        </Card>
      </div>

      {/* Workout Grid */}
      <WorkoutGrid
        workouts={workouts}
        startDate={new Date('2024-01-01')}
        currentWeek={2}
        totalWeeks={14}
        variant={variant}
        onWorkoutClick={handleWorkoutClick}
        onWorkoutComplete={handleWorkoutComplete}
      />
    </div>
  );
} 