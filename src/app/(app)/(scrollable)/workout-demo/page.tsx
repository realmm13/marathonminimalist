import { WorkoutDemo } from '@/components/training/WorkoutDemo';
import { TrainingBreadcrumb } from '@/components/training/TrainingBreadcrumb';

export default function WorkoutDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TrainingBreadcrumb className="mb-6" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workout Cards Demo</h1>
        <p className="text-muted-foreground">
          Interactive workout cards and grid layouts for marathon training
        </p>
      </div>
      
      <WorkoutDemo />
    </div>
  );
} 