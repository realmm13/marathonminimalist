'use client';

import { WorkoutGrid } from '@/components/training/WorkoutGrid';
import { WorkoutCardProps } from '@/components/training/WorkoutCard';

export default function WorkoutDemoPage() {
  const handleWorkoutClick = (workout: WorkoutCardProps) => {
    console.log('Demo workout clicked:', workout);
  };

  const handleWorkoutComplete = (workout: WorkoutCardProps) => {
    console.log('Demo workout completed:', workout);
  };

  return (
    <div className="container-enhanced py-6">
      <WorkoutGrid 
        workouts={[]}
        startDate={new Date()}
        currentWeek={1}
        totalWeeks={14}
        variant="list"
        onWorkoutClick={handleWorkoutClick}
        onWorkoutComplete={handleWorkoutComplete}
      />
    </div>
  );
} 