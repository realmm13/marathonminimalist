'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { api } from '@/trpc/react';
import { WorkoutGrid } from '@/components/training/WorkoutGrid';
import { WorkoutCardProps } from '@/components/training/WorkoutCard';
import { WorkoutDetailModal } from '@/components/training/WorkoutDetailModal';
import { useDialog } from '@/components/DialogManager';
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
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Define distance unit constants to avoid runtime enum issues
const DISTANCE_UNITS = {
  KILOMETERS: 'KILOMETERS',
  MILES: 'MILES'
} as const;

type DistanceUnitType = typeof DISTANCE_UNITS[keyof typeof DISTANCE_UNITS];

export default function WorkoutsPage() {
  // View state management
  const [currentView, setCurrentView] = React.useState<'list' | 'compact'>('list');

  // Dialog hook for workout details
  const { openDialog } = useDialog();

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

  // Check if the error is due to incomplete profile setup
  const isProfileIncomplete = planError?.data?.code === "PRECONDITION_FAILED";
  const errorMessage = isProfileIncomplete 
    ? "Please complete your profile setup by setting your goal marathon time in the Profile page."
    : "Training Plan Not Available";

  // Calculate completion statistics - memoized for performance
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

  // Convert training plan workouts to WorkoutCardProps format - optimized
  const convertToWorkoutCards = useCallback((plan: any): WorkoutCardProps[] => {
    if (!plan?.plan?.workouts) return [];
    
    return plan.plan.workouts.map((workout: any, index: number) => ({
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
      structure: workout.structure,
      isCompleted: workout.isCompleted || false,
      isToday: false, // Calculated in WorkoutGrid for performance
      isUpcoming: workout.week >= currentWeek,
      isPast: workout.week < currentWeek,
    }));
  }, [currentWeek]);

  const workouts = useMemo(() => convertToWorkoutCards(trainingPlanData), [convertToWorkoutCards, trainingPlanData]);

  // Calculate plan statistics using completion data from API - memoized
  const planStats = useMemo(() => {
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

  const handleWorkoutClick = useCallback((workout: WorkoutCardProps) => {
    console.log('Workout clicked:', workout);
    
    // Open workout detail modal
    openDialog({
      title: workout.name,
      component: WorkoutDetailModal,
      props: {
        workout,
        onComplete: () => handleWorkoutComplete(workout),
        onUncomplete: () => handleWorkoutUncomplete(workout),
      },
      size: 'lg',
      showCloseButton: true,
    });
  }, [openDialog]);

  // Mutation for marking workouts as complete - optimized cache invalidation
  const utils = api.useUtils();
  const markWorkoutCompleteMutation = api.training.markWorkoutComplete.useMutation({
    onSuccess: () => {
      // More granular cache invalidation - only invalidate completion-related data
      void utils.training.getWorkoutCompletions.invalidate();
      // Only invalidate the training plan if we need to update completion status
      void utils.training.generatePlan.invalidate();
    },
    onError: (error) => {
      console.error('Error marking workout complete:', error);
      // TODO: Show error toast
    },
  });

  // Mutation for marking workouts as incomplete - optimized cache invalidation
  const markWorkoutIncompleteMutation = api.training.markWorkoutIncomplete.useMutation({
    onSuccess: () => {
      // More granular cache invalidation - only invalidate completion-related data
      void utils.training.getWorkoutCompletions.invalidate();
      // Only invalidate the training plan if we need to update completion status
      void utils.training.generatePlan.invalidate();
    },
    onError: (error) => {
      console.error('Error marking workout incomplete:', error);
      // TODO: Show error toast
    },
  });

  const handleWorkoutComplete = useCallback((workout: WorkoutCardProps) => {
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
  }, [markWorkoutCompleteMutation]);

  const handleWorkoutUncomplete = useCallback((workout: WorkoutCardProps) => {
    console.log('handleWorkoutUncomplete called with:', workout);
    console.log('Workout ID:', workout.id);
    
    if (!workout.isCompleted) {
      console.log('Workout is not completed:', workout);
      return;
    }

    // Ensure workout has a valid ID
    if (!workout.id) {
      console.error('Workout ID is missing');
      return;
    }

    console.log('Marking workout as incomplete:', workout.id);

    // Mark workout as incomplete
    markWorkoutIncompleteMutation.mutate({
      workoutId: workout.id,
    });
  }, [markWorkoutIncompleteMutation]);

  // View options for segmented control - memoized
  const viewOptions = useMemo(() => [
    { value: 'list', label: 'List' },
    { value: 'compact', label: 'Compact' }
  ], []);

  const router = useRouter();

  // Show loading state
  if (isLoadingPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading training plan...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (planError || !trainingPlanData?.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{errorMessage}</h2>
              <p className="text-muted-foreground mb-6">
                {isProfileIncomplete 
                  ? "Set your goal marathon time and preferences to generate your personalized training plan."
                  : "Please complete your profile settings to generate your personalized training plan."
                }
              </p>
              <Button 
                onClick={() => router.push('/profile')}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isProfileIncomplete ? "Complete Profile Setup" : "Complete Profile Setup"}
              </Button>
            </div>
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
          onWorkoutUncomplete={handleWorkoutUncomplete}
        />
      </div>
    </div>
  );
} 