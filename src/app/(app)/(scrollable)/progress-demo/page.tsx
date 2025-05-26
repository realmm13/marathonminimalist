import { ProgressDashboard } from '@/components/training/ProgressDashboard';
import { TrainingBreadcrumb } from '@/components/training/TrainingBreadcrumb';

export default function ProgressDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TrainingBreadcrumb className="mb-6" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progress Dashboard Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive training analytics and progress tracking for marathon preparation
        </p>
      </div>
      
      <ProgressDashboard />
    </div>
  );
} 