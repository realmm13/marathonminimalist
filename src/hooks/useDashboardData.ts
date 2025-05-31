import { useMemo } from 'react';
import { api } from '@/trpc/react';
import { subWeeks, differenceInWeeks, format, startOfWeek, endOfWeek } from 'date-fns';

export interface DashboardMetrics {
  // Training Overview
  weeksToMarathon: number;
  trainingCompletePercentage: number;
  peakWeeklyMiles: number;
  
  // This Week Summary
  thisWeekDistance: number;
  thisWeekWorkoutsCompleted: number;
  thisWeekTotalWorkouts: number;
  thisWeekAveragePace: string | null;
  thisWeekGoalProgress: number;
  
  // Additional data
  currentWeek: number;
  marathonDate: Date | null;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardMetrics {
  // Fetch current week information
  const { data: currentWeekData, isLoading: currentWeekLoading, error: currentWeekError } = 
    api.training.getCurrentWeek.useQuery();

  // Fetch marathon settings
  const { data: marathonSettings, isLoading: marathonLoading, error: marathonError } = 
    api.user.getMarathonSettings.useQuery();

  // Fetch training plan
  const { data: trainingPlan, isLoading: planLoading, error: planError } = 
    api.training.generatePlan.useQuery({});

  // Calculate date range for this week's data
  const thisWeekRange = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    return {
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    };
  }, []);

  // Fetch this week's workout completions
  const { data: thisWeekCompletions, isLoading: completionsLoading, error: completionsError } = 
    api.training.getWorkoutCompletions.useQuery({
      startDate: thisWeekRange.start,
      endDate: thisWeekRange.end,
    });

  // Calculate comprehensive dashboard metrics
  const metrics = useMemo((): DashboardMetrics => {
    const isLoading = currentWeekLoading || marathonLoading || planLoading || completionsLoading;
    const error = currentWeekError?.message || marathonError?.message || planError?.message || completionsError?.message || null;

    // Default values
    let weeksToMarathon = 0;
    let trainingCompletePercentage = 0;
    let peakWeeklyMiles = 0;
    let thisWeekDistance = 0;
    let thisWeekWorkoutsCompleted = 0;
    let thisWeekTotalWorkouts = 0;
    let thisWeekAveragePace: string | null = null;
    let thisWeekGoalProgress = 0;
    let currentWeek = 1;
    let marathonDate: Date | null = null;

    // Calculate weeks to marathon
    if (marathonSettings?.marathonDate) {
      marathonDate = new Date(marathonSettings.marathonDate);
      const now = new Date();
      weeksToMarathon = Math.max(0, differenceInWeeks(marathonDate, now));
    }

    // Calculate training completion percentage and current week
    if (currentWeekData) {
      currentWeek = currentWeekData.currentWeek;
      
      if (trainingPlan?.plan) {
        const totalWorkouts = trainingPlan.plan.workouts.length;
        const completedWorkouts = trainingPlan.plan.workouts.filter(w => w.isCompleted).length;
        trainingCompletePercentage = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

        // Calculate peak weekly miles from training plan
        const weeklyMiles = new Map<number, number>();
        trainingPlan.plan.workouts.forEach(workout => {
          const currentMiles = weeklyMiles.get(workout.week) || 0;
          const workoutDistance = workout.distance || 0;
          weeklyMiles.set(workout.week, currentMiles + workoutDistance);
        });
        peakWeeklyMiles = Math.max(...Array.from(weeklyMiles.values()), 0);
      }
    }

    // Calculate this week's metrics
    if (thisWeekCompletions?.completions) {
      const completions = thisWeekCompletions.completions;
      
      // Total distance this week
      thisWeekDistance = completions.reduce((sum, completion) => 
        sum + (completion.actualDistance || 0), 0
      );

      // Workouts completed this week
      thisWeekWorkoutsCompleted = completions.length;

      // Calculate average pace
      const validPaces = completions
        .map(c => c.actualPace)
        .filter(Boolean)
        .map(pace => {
          try {
            const parts = pace!.split(':');
            if (parts.length !== 2) return null;
            
            const minStr = parts[0];
            const secStr = parts[1];
            
            if (!minStr || !secStr) return null;
            
            const min = parseInt(minStr, 10);
            const sec = parseInt(secStr, 10);
            
            if (isNaN(min) || isNaN(sec)) return null;
            
            return min * 60 + sec;
          } catch {
            return null;
          }
        })
        .filter((pace): pace is number => pace !== null);

      if (validPaces.length > 0) {
        const avgPaceSeconds = validPaces.reduce((sum, pace) => sum + pace, 0) / validPaces.length;
        const minutes = Math.floor(avgPaceSeconds / 60);
        const seconds = Math.round(avgPaceSeconds % 60);
        thisWeekAveragePace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }

    // Calculate total workouts planned for this week
    if (trainingPlan?.plan && currentWeek) {
      thisWeekTotalWorkouts = trainingPlan.plan.workouts.filter(w => w.week === currentWeek).length;
    }

    // Calculate goal progress (completion rate for this week)
    if (thisWeekTotalWorkouts > 0) {
      thisWeekGoalProgress = Math.round((thisWeekWorkoutsCompleted / thisWeekTotalWorkouts) * 100);
    }

    return {
      weeksToMarathon,
      trainingCompletePercentage,
      peakWeeklyMiles: Math.round(peakWeeklyMiles * 10) / 10, // Round to 1 decimal
      thisWeekDistance: Math.round(thisWeekDistance * 10) / 10, // Round to 1 decimal
      thisWeekWorkoutsCompleted,
      thisWeekTotalWorkouts,
      thisWeekAveragePace,
      thisWeekGoalProgress,
      currentWeek,
      marathonDate,
      isLoading,
      error,
    };
  }, [
    currentWeekData,
    marathonSettings,
    trainingPlan,
    thisWeekCompletions,
    currentWeekLoading,
    marathonLoading,
    planLoading,
    completionsLoading,
    currentWeekError,
    marathonError,
    planError,
    completionsError,
  ]);

  return metrics;
}

// Helper hook for refreshing dashboard data
export function useDashboardRefresh() {
  const utils = api.useUtils();
  
  const refreshDashboard = async () => {
    await Promise.all([
      utils.training.getCurrentWeek.invalidate(),
      utils.user.getMarathonSettings.invalidate(),
      utils.training.generatePlan.invalidate(),
      utils.training.getWorkoutCompletions.invalidate(),
    ]);
  };

  return { refreshDashboard };
} 