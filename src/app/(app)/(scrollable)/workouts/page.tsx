'use client';

import React, { useState, useMemo } from 'react';
import { api } from '@/trpc/react';
import { WorkoutGrid } from '@/components/training/WorkoutGrid';
import { WorkoutCardProps } from '@/components/training/WorkoutCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Spinner } from '@/components/Spinner';
import { 
  Calendar, 
  Target, 
  Activity, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Settings
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { WorkoutType } from '@/generated/prisma';
import { useUserSetting } from '@/hooks/useUserSetting';
import Link from 'next/link';

// Define distance unit constants to avoid runtime enum issues
const DISTANCE_UNITS = {
  KILOMETERS: 'KILOMETERS',
  MILES: 'MILES'
} as const;

type DistanceUnitType = typeof DISTANCE_UNITS[keyof typeof DISTANCE_UNITS];

export default function WorkoutsPage() {
  // View state management
  const [currentView, setCurrentView] = useState<'list' | 'compact'>('list');
  
  // Get user's distance unit preference
  const { value: distanceUnitValue } = useUserSetting('marathonDistanceUnit');
  const distanceUnit = (distanceUnitValue as DistanceUnitType) || DISTANCE_UNITS.MILES;
  
  // Fetch training plan
  const { 
    data: trainingPlanData, 
    isLoading: isLoadingPlan, 
    error: planError 
  } = api.training.generatePlan.useQuery({});

  // Log the result for debugging
  React.useEffect(() => {
    if (planError) {
      console.error('Training plan generation error:', planError);
    }
    if (trainingPlanData) {
      console.log('Training plan generated successfully:', trainingPlanData);
    }
  }, [planError, trainingPlanData]);

  // Calculate completion statistics
  const completionStats = useMemo(() => {
    if (!trainingPlanData?.plan?.workouts) {
      return {
        totalWorkouts: 0,
        completedWorkouts: 0,
        totalDistance: 0,
        completedDistance: 0,
        completionPercentage: 0,
      };
    }

    const workouts = trainingPlanData.plan.workouts;
    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter((w: any) => w.isCompleted).length;
    const totalDistance = workouts.reduce((sum: number, workout: any) => sum + (workout.distance || 0), 0);
    const completedDistance = workouts.filter((w: any) => w.isCompleted).reduce((sum: number, workout: any) => sum + (workout.distance || 0), 0);
    const completionPercentage = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

    return {
      totalWorkouts,
      completedWorkouts,
      totalDistance,
      completedDistance,
      completionPercentage,
    };
  }, [trainingPlanData?.plan?.workouts]);

  // Fetch training plan and current week
  const { data: currentWeekData, isLoading: weekLoading } = api.training.getCurrentWeek.useQuery();
  
  const isLoading = isLoadingPlan || weekLoading;
  const currentWeek = currentWeekData?.currentWeek || 1;

  // Convert training plan workouts to WorkoutCardProps format
  const convertToWorkoutCards = (plan: any): WorkoutCardProps[] => {
    if (!plan?.plan?.workouts) return [];
    
    const workoutCards = plan.plan.workouts.map((workout: any, index: number) => ({
      id: workout.id || `${workout.week}-${workout.day || (index % 7) + 1}`,
      name: workout.name,
      description: workout.description,
      type: workout.type as WorkoutType,
      week: workout.week,
      day: workout.day,
      scheduledDate: new Date(workout.scheduledDate),
      distance: workout.distance,
      duration: workout.duration,
      pace: workout.pace,
      intervals: workout.intervals,
      isCompleted: workout.isCompleted || false,
      isToday: false, // Will be calculated in WorkoutGrid
      isUpcoming: workout.week >= currentWeek,
      isPast: workout.week < currentWeek,
    }));

    // Debug logging
    console.log('Converted workout cards:', workoutCards);
    console.log('First workout card:', workoutCards[0]);
    
    return workoutCards;
  };

  const workouts = convertToWorkoutCards(trainingPlanData);

  // Calculate plan statistics using completion data from API
  const planStats = React.useMemo(() => {
    if (!completionStats) return null;
    
    const goalTime = trainingPlanData?.userSettings?.goalMarathonTime || '4:00:00';
    
    // Convert distance based on user preference
    const convertedTotalDistance = distanceUnit === DISTANCE_UNITS.MILES 
      ? completionStats.totalDistance * 0.621371 
      : completionStats.totalDistance;
    const convertedCompletedDistance = distanceUnit === DISTANCE_UNITS.MILES 
      ? completionStats.completedDistance * 0.621371 
      : completionStats.completedDistance;
    const unitLabel = distanceUnit === DISTANCE_UNITS.MILES ? 'mi' : 'km';
    
    return {
      totalWorkouts: completionStats.totalWorkouts,
      completedWorkouts: completionStats.completedWorkouts,
      totalDistance: Math.round(convertedTotalDistance),
      completedDistance: Math.round(convertedCompletedDistance),
      unitLabel,
      goalTime,
      completionPercentage: completionStats.completionPercentage
    };
  }, [completionStats, distanceUnit, trainingPlanData]);

  const handleWorkoutClick = (workout: WorkoutCardProps) => {
    console.log('Workout clicked:', workout);
    // TODO: Navigate to workout detail page or open modal
  };

  // Mutation for marking workouts as complete
  const utils = api.useUtils();
  const markWorkoutCompleteMutation = api.training.markWorkoutComplete.useMutation({
    onSuccess: () => {
      // Refetch the training plan to update completion status
      void utils.training.generatePlan.invalidate();
    },
    onError: (error) => {
      console.error('Error marking workout complete:', error);
      // TODO: Show error toast
    },
  });

  const handleWorkoutComplete = (workout: WorkoutCardProps) => {
    console.log('handleWorkoutComplete called with:', workout);
    console.log('Workout ID:', workout.id);
    console.log('Workout week:', workout.week);
    console.log('Workout day:', workout.day);
    
    if (workout.isCompleted) {
      // TODO: Handle uncompleting workout (would need a separate API endpoint)
      console.log('Workout already completed:', workout);
      return;
    }

    // Ensure workout has a valid ID
    if (!workout.id) {
      console.error('Workout ID is missing');
      return;
    }

    console.log('Marking workout as complete:', workout.id);

    // Mark workout as complete
    markWorkoutCompleteMutation.mutate({
      workoutId: workout.id,
      completedAt: new Date().toISOString(),
      notes: `Completed ${workout.name}`,
    });
  };

  // View options for segmented control
  const viewOptions = [
    { value: 'list', label: 'List' },
    { value: 'compact', label: 'Compact' }
  ];

  if (isLoading) {
    return (
      <div className="container-enhanced py-2">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Generating your personalized training plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trainingPlanData || !trainingPlanData.success) {
    return (
      <div className="container-enhanced py-2">
        <div className="flex items-center justify-center py-12">
          <Card className="p-8 max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="heading-4 mb-2">Training Plan Not Available</h3>
            <p className="body-small text-muted-foreground mb-4">
              Please complete your profile settings to generate your personalized training plan.
            </p>
            <Link href="/profile">
              <button className="btn-primary flex items-center gap-2 mx-auto">
                <Settings className="h-4 w-4" />
                Complete Profile Setup
              </button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-enhanced py-2">
      {/* Enhanced header section */}
      <div className="mb-6 animate-slide-down">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="heading-1 text-gradient">
              Marathon Training Plan
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl">
              Your personalized 14-week training program based on your goals and preferences
            </p>
          </div>
          
          {/* View Controls */}
          <SegmentedControl
            options={viewOptions}
            value={currentView}
            onChange={(value) => setCurrentView(value as 'list' | 'compact')}
            size="md"
            className="bg-muted border-0 shadow-none"
            activeTabClassName="bg-primary text-primary-foreground shadow-sm border-0"
          />
        </div>

        {/* Training plan summary */}
        {trainingPlanData?.userSettings && (
          <div className="flex items-center gap-6 body-small text-muted-foreground">
            {trainingPlanData.userSettings.marathonDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Race: {format(new Date(trainingPlanData.userSettings.marathonDate), 'MMM d, yyyy')}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Distance Unit: {distanceUnit === DISTANCE_UNITS.MILES ? 'Miles' : 'Kilometers'}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {planStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <Card className="card-enhanced p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{planStats.totalWorkouts}</div>
                <div className="body-small text-muted-foreground">Total Workouts</div>
              </div>
            </div>
          </Card>
          
          <Card className="card-enhanced p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{planStats.completedWorkouts} of {planStats.totalWorkouts}</div>
                <div className="body-small text-muted-foreground">Workouts Completed ({planStats.completionPercentage}%)</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${planStats.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="card-enhanced p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{planStats.completedDistance} / {planStats.totalDistance} {planStats.unitLabel}</div>
                <div className="body-small text-muted-foreground">Distance Progress</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${planStats.totalDistance > 0 ? (planStats.completedDistance / planStats.totalDistance) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="card-enhanced p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{planStats.goalTime}</div>
                <div className="body-small text-muted-foreground">Goal Time</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Workout Grid */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <WorkoutGrid
          workouts={workouts}
          startDate={trainingPlanData?.plan?.startDate ? new Date(trainingPlanData.plan.startDate) : new Date()}
          currentWeek={currentWeek}
          totalWeeks={14}
          variant={currentView}
          onWorkoutClick={handleWorkoutClick}
          onWorkoutComplete={handleWorkoutComplete}
        />
      </div>
    </div>
  );
} 