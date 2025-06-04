"use client";

import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useDashboardData, useDashboardRefresh } from '@/hooks/useDashboardData';
import { Spinner } from '@/components/Spinner';
import { CustomButton } from '@/components/CustomButton';
import { api } from '@/trpc/react';
import { WorkoutCard } from '@/components/training/WorkoutCard';
import { WorkoutType } from '@/generated/prisma';
import { useMemo } from 'react';
import { Calendar } from '@/components/calendar/Calendar';

export function DashboardContent() {
  const dashboardData = useDashboardData();
  const { refreshDashboard } = useDashboardRefresh();

  // Get current week's workouts
  const { data: trainingPlanData, isLoading: isLoadingPlan } = api.training.generatePlan.useQuery({});
  const { data: currentWeekData } = api.training.getCurrentWeek.useQuery();
  
  const currentWeek = currentWeekData?.currentWeek || 1;

  // Filter workouts for current week
  const currentWeekWorkouts = useMemo(() => {
    if (!trainingPlanData?.plan?.workouts) return [];
    
    return trainingPlanData.plan.workouts
      .filter((workout: any) => workout.week === currentWeek)
      .map((workout: any) => ({
        id: workout.id || `${workout.week}-${workout.day}`,
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
        isToday: false,
        isUpcoming: true,
        isPast: false,
      }));
  }, [trainingPlanData?.plan?.workouts, currentWeek]);

  // Handle loading state
  if (dashboardData.isLoading || isLoadingPlan) {
    return (
      <div className="container-enhanced py-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner className="mx-auto mb-4" />
            <p className="body-large text-muted-foreground">Loading your training dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (dashboardData.error) {
    return (
      <div className="container-enhanced py-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="heading-5 mb-2">Unable to load dashboard</h3>
            <p className="body-large text-muted-foreground mb-4">{dashboardData.error}</p>
            <CustomButton 
              onClick={refreshDashboard}
              leftIcon={RefreshCw}
              variant="outline"
            >
              Try Again
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-enhanced py-0">
      
      {/* Enhanced header section */}
      <div className="mb-3 animate-slide-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 mb-4 text-gradient">
              Marathon Training Dashboard
            </h1>
          </div>
          <CustomButton 
            onClick={refreshDashboard}
            leftIcon={RefreshCw}
            variant="ghost"
            size="sm"
            className="hidden md:flex"
          >
            Refresh
          </CustomButton>
        </div>
      </div>

      {/* Main dashboard layout - Calendar on left, other components on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Left column - Training Calendar */}
        <div className="animate-fade-in-up order-2 lg:order-1" style={{ animationDelay: '0.3s' }}>
          <Calendar
            workouts={trainingPlanData?.plan?.workouts || []}
            marathonDate={dashboardData.marathonDate ? new Date(dashboardData.marathonDate) : undefined}
            className="card-enhanced"
            onEventClick={(event) => {
              console.log('Calendar event clicked:', event);
            }}
            onDateSelect={(date) => {
              console.log('Calendar date selected:', date);
            }}
          />
        </div>

        {/* Right column - Training Overview and This Week Summary */}
        <div className="space-y-8 order-1 lg:order-2">
          
          {/* Training Overview */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card className="card-enhanced p-6">
              <h3 className="heading-5 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Training Overview
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {dashboardData.weeksToMarathon || 'N/A'}
                  </div>
                  <div className="body-small text-muted-foreground">
                    {dashboardData.weeksToMarathon === 1 ? 'Week' : 'Weeks'} to Race Day
                  </div>
                  {dashboardData.marathonDate && (
                    <div className="body-small text-muted-foreground mt-1">
                      {new Date(dashboardData.marathonDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {dashboardData.trainingCompletePercentage}%
                  </div>
                  <div className="body-small text-muted-foreground">Training Complete</div>
                  <div className="progress-bar mt-2" style={{ 
                    '--progress': `${dashboardData.trainingCompletePercentage}%` 
                  } as React.CSSProperties}></div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {dashboardData.peakWeeklyMiles || 0}
                  </div>
                  <div className="body-small text-muted-foreground">Peak Weekly Miles</div>
                </div>
              </div>
            </Card>
          </div>

          {/* This Week Summary */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <Card className="card-enhanced p-6">
              <h3 className="heading-5 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                This Week Summary
                <Badge variant="outline" color="gray" className="ml-2">
                  Week {dashboardData.currentWeek}
                </Badge>
              </h3>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {dashboardData.thisWeekDistance} mi
                  </div>
                  <div className="body-small text-muted-foreground">Total Mileage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {dashboardData.thisWeekWorkoutsCompleted} of {dashboardData.thisWeekTotalWorkouts}
                  </div>
                  <div className="body-small text-muted-foreground">Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {dashboardData.daysToMarathon}
                  </div>
                  <div className="body-small text-muted-foreground">Days to Race Day</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {dashboardData.thisWeekGoalProgress}%
                  </div>
                  <div className="body-small text-muted-foreground">Goal Progress</div>
                  <div className="progress-bar mt-2" style={{ 
                    '--progress': `${dashboardData.thisWeekGoalProgress}%` 
                  } as React.CSSProperties}></div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* This Week's Workouts - moved to bottom */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <Card className="card-enhanced p-6">
          <h3 className="heading-5 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            This Week's Workouts
            <Badge variant="outline" color="gray" className="ml-2">
              Week {currentWeek}
            </Badge>
          </h3>
          
          {currentWeekWorkouts.length > 0 ? (
            <div className="w-full">
              <div className="flex flex-wrap justify-center items-start gap-4 md:gap-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                {currentWeekWorkouts.map((workout) => (
                  <div key={workout.id} className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-[320px] flex-shrink-0">
                    <WorkoutCard
                      {...workout}
                      variant="compact"
                      onClick={() => {
                        // Handle workout click - could navigate to workout details
                        console.log('Workout clicked:', workout);
                      }}
                      onComplete={() => {
                        // Handle workout completion
                        console.log('Workout completed:', workout);
                      }}
                      onUncomplete={() => {
                        // Handle workout uncompletion
                        console.log('Workout uncompleted:', workout);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h4 className="heading-6 mb-2">No workouts this week</h4>
              <p className="body-small text-muted-foreground">
                This week is scheduled for rest or you haven't set up your training plan yet.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 