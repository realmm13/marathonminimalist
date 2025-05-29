import { WorkoutGrid } from '@/components/training/WorkoutGrid';

export default function WorkoutDemoPage() {
  return (
    <div className="container-enhanced py-6">
      <WorkoutGrid 
        workouts={[]}
        startDate={new Date()}
        currentWeek={1}
        totalWeeks={14}
        variant="list"
        onWorkoutClick={() => {}}
        onWorkoutComplete={() => {}}
      />
    </div>
  );
} 