'use client';

import React, { useState } from 'react';
import { WorkoutGrid } from './WorkoutGrid';
import { WorkoutCardProps } from './WorkoutCard';
import { WorkoutType } from '@/generated/prisma';
import { addDays, addWeeks } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/SegmentedControl';

// Sample workout data for a 14-week marathon training plan
const generateSampleWorkouts = (): WorkoutCardProps[] => {
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
        distance: 5,
        duration: 35,
        pace: '6:30/km',
        isCompleted: week === 1,
      },
      {
        name: 'Tempo Run',
        description: '20 minutes at marathon pace after warm-up',
        type: WorkoutType.TEMPO_RUN,
        week,
        day: 3,
        scheduledDate: addDays(weekStart, 2),
        distance: 8,
        duration: 50,
        pace: '5:45/km',
        isCompleted: week === 1,
      },
      {
        name: 'Long Run',
        description: 'Easy pace with 2 miles at marathon pace',
        type: WorkoutType.LONG_RUN,
        week,
        day: 6,
        scheduledDate: addDays(weekStart, 5),
        distance: week === 1 ? 12 : 14,
        duration: week === 1 ? 75 : 85,
        pace: '6:00/km',
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
        distance: 6,
        duration: 40,
        pace: '6:30/km',
        isCompleted: false,
      },
      {
        name: '800m Intervals',
        description: '6 x 800m at 5K pace with 400m recovery',
        type: WorkoutType.INTERVAL_800M,
        week,
        day: 3,
        scheduledDate: addDays(weekStart, 2),
        distance: 10,
        duration: 55,
        pace: '4:45/km',
        isCompleted: false,
      },
      {
        name: 'Tempo Run',
        description: '30 minutes at marathon pace',
        type: WorkoutType.TEMPO_RUN,
        week,
        day: 5,
        scheduledDate: addDays(weekStart, 4),
        distance: 10,
        duration: 60,
        pace: '5:45/km',
        isCompleted: false,
      },
      {
        name: 'Long Run',
        description: `Easy pace with ${Math.min(week - 1, 4)} miles at marathon pace`,
        type: WorkoutType.LONG_RUN,
        week,
        day: 7,
        scheduledDate: addDays(weekStart, 6),
        distance: 14 + (week - 3) * 2,
        duration: 90 + (week - 3) * 10,
        pace: '6:00/km',
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
  const workouts = generateSampleWorkouts();

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