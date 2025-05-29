'use client';

import { ProgressChart, ProgressDataPoint, ChartConfig } from './ProgressChart';
import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { useUserSetting } from '@/hooks/useUserSetting';
import { cn } from '@/lib/utils';

// Local enum that matches Prisma DistanceUnit to avoid runtime import issues
enum LocalDistanceUnit {
  KILOMETERS = 'KILOMETERS',
  MILES = 'MILES'
}

// Helper function to convert distances based on user preference
const convertDistance = (kmValue: number, unit: string): number => {
  return unit === LocalDistanceUnit.MILES ? kmValue * 0.621371 : kmValue;
};

// Helper functions for unit labels
const getUnitName = (unit: string): string => {
  return unit === LocalDistanceUnit.MILES ? 'miles' : 'kilometers';
};

const getUnitLabel = (unit: string): 'mi' | 'km' => {
  return unit === LocalDistanceUnit.MILES ? 'mi' : 'km';
};

const getPaceUnitLabel = (unit: string): '/mi' | '/km' => {
  return unit === LocalDistanceUnit.MILES ? '/mi' : '/km';
};

// Sample data for different chart types (in km, will be converted based on user preference)
const weeklyDistanceDataKm: ProgressDataPoint[] = [
  { date: 'Week 1', distance: 25, week: 1 },
  { date: 'Week 2', distance: 28, week: 2 },
  { date: 'Week 3', distance: 32, week: 3 },
  { date: 'Week 4', distance: 30, week: 4 },
  { date: 'Week 5', distance: 35, week: 5 },
  { date: 'Week 6', distance: 38, week: 6 },
  { date: 'Week 7', distance: 42, week: 7 },
  { date: 'Week 8', distance: 40, week: 8 },
  { date: 'Week 9', distance: 45, week: 9 },
  { date: 'Week 10', distance: 48, week: 10 },
  { date: 'Week 11', distance: 35, week: 11 },
  { date: 'Week 12', distance: 25, week: 12 },
  { date: 'Week 13', distance: 20, week: 13 },
  { date: 'Week 14', distance: 42.2, week: 14 }, // Marathon week
];

// Pace data (in min/km, will be converted for miles)
const paceProgressDataKm: ProgressDataPoint[] = [
  { date: 'Week 1', pace: 5.5, week: 1 },
  { date: 'Week 2', pace: 5.4, week: 2 },
  { date: 'Week 3', pace: 5.3, week: 3 },
  { date: 'Week 4', pace: 5.2, week: 4 },
  { date: 'Week 5', pace: 5.1, week: 5 },
  { date: 'Week 6', pace: 5.0, week: 6 },
  { date: 'Week 7', pace: 4.9, week: 7 },
  { date: 'Week 8', pace: 4.8, week: 8 },
  { date: 'Week 9', pace: 4.7, week: 9 },
  { date: 'Week 10', pace: 4.6, week: 10 },
  { date: 'Week 11', pace: 4.5, week: 11 },
  { date: 'Week 12', pace: 4.4, week: 12 },
  { date: 'Week 13', pace: 4.3, week: 13 },
  { date: 'Week 14', pace: 4.2, week: 14 },
];

const workoutTypeData: ProgressDataPoint[] = [
  { date: 'Easy Runs', distance: 45, week: 1 },
  { date: 'Tempo Runs', distance: 25, week: 2 },
  { date: 'Intervals', distance: 15, week: 3 },
  { date: 'Long Runs', distance: 15, week: 4 },
];

export function ProgressDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('14weeks');
  
  // Get user's distance unit preference with proper typing and fallback
  const { value: distanceUnitValue } = useUserSetting('marathonDistanceUnit');
  const distanceUnit = (distanceUnitValue as string) || LocalDistanceUnit.MILES;
  
  // Convert data based on user preference
  const weeklyDistanceData = weeklyDistanceDataKm.map(item => ({
    ...item,
    distance: item.distance ? convertDistance(item.distance, distanceUnit) : undefined
  }));
  
  // Convert pace data (km pace to mile pace: multiply by 1.609344)
  const paceProgressData = paceProgressDataKm.map(item => ({
    ...item,
    pace: item.pace ? (distanceUnit === LocalDistanceUnit.MILES ? item.pace * 1.609344 : item.pace) : undefined
  }));
  
  // Calculate total distance for summary
  const totalDistance = weeklyDistanceData.reduce((sum, week) => sum + (week.distance || 0), 0);
  const validPaces = paceProgressData.map(week => week.pace).filter((pace): pace is number => pace !== undefined && pace > 0);
  const bestPace = validPaces.length > 0 ? Math.min(...validPaces) : 0;
  
  const unitLabel = getUnitName(distanceUnit);
  const paceUnitLabel = getPaceUnitLabel(distanceUnit);

  const chartConfigs: Record<string, ChartConfig> = {
    distance: {
      title: 'Weekly Distance',
      description: `Total ${unitLabel} per week`,
      color: '#3b82f6',
      trend: 'up',
      trendValue: distanceUnit === LocalDistanceUnit.MILES ? '+2.1 mi' : '+3.4 km',
      icon: <Activity className="h-4 w-4" />,
    },
    pace: {
      title: 'Average Pace Improvement',
      description: `Minutes per ${unitLabel.slice(0, -1)}`, // Remove 's' from 'miles' or use 'km'
      color: '#10b981',
      trend: 'down',
      trendValue: distanceUnit === LocalDistanceUnit.MILES ? '-32s/mile' : '-20s/km',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    workoutTypes: {
      title: 'Workout Distribution',
      description: 'Training type breakdown',
      color: '#f59e0b',
      trend: 'neutral',
      trendValue: 'Balanced',
      icon: <Target className="h-4 w-4" />,
    },
  };

  const summaryStats = [
    {
      label: 'Total Distance',
      value: `${Math.round(totalDistance)} ${unitLabel}`,
      change: '+15.2%',
      trend: 'up' as const,
      icon: <Activity className="h-5 w-5" />,
    },
    {
      label: 'Best Pace',
      value: `${Math.floor(bestPace)}:${String(Math.round((bestPace % 1) * 60)).padStart(2, '0')}${paceUnitLabel}`,
      change: distanceUnit === LocalDistanceUnit.MILES ? '-52s' : '-32s',
      trend: 'down' as const,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: 'Workouts',
      value: '56', // 14 weeks * 4 workouts per week
      change: '+12',
      trend: 'up' as const,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: 'Training Load',
      value: 'Moderate',
      change: 'Optimal',
      trend: 'neutral' as const,
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="heading-2 gradient-text">Training Progress</h2>
          <p className="body-large text-muted-foreground">
            Track your 14-week marathon training journey
          </p>
        </div>
        <SegmentedControl
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          options={[
            { label: '8 Weeks', value: '8weeks' },
            { label: '14 Weeks', value: '14weeks' },
          ]}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, index) => (
          <Card key={index} className="card-enhanced p-6 hover-lift group">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                {stat.icon}
              </div>
              <Badge 
                color={stat.trend === 'up' ? 'green' : stat.trend === 'down' ? 'blue' : 'gray'}
                className={cn(
                  "badge-enhanced font-medium",
                  stat.trend === 'up' && 'badge-success',
                  stat.trend === 'down' && 'badge-info'
                )}
              >
                {stat.change}
              </Badge>
            </div>
            <div className="mt-6 space-y-1">
              <div className="heading-4 font-bold">{stat.value}</div>
              <p className="body-small text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Weekly Distance - Area Chart */}
        <div className="animate-slide-down" style={{ animationDelay: '100ms' }}>
          <ProgressChart
            data={weeklyDistanceData}
            type="area"
            config={{
              title: 'Weekly Distance',
              description: `Total ${unitLabel} per week`,
              color: '#3b82f6',
              trend: 'up',
              trendValue: distanceUnit === LocalDistanceUnit.MILES ? '+2.1 mi' : '+3.4 km',
              icon: <Activity className="h-4 w-4" />
            }}
            dataKey="distance"
            xAxisKey="week"
            height={300}
            distanceUnit={getUnitLabel(distanceUnit)}
            paceUnit={getPaceUnitLabel(distanceUnit)}
          />
        </div>

        {/* Pace Progress - Line Chart */}
        <div className="animate-slide-down" style={{ animationDelay: '200ms' }}>
          <ProgressChart
            data={paceProgressData}
            type="line"
            config={{
              title: 'Pace Progress',
              description: `Minutes per ${unitLabel.slice(0, -1)}`, // Remove 's' from 'miles' or use 'km'
              color: '#10b981',
              trend: 'down',
              trendValue: distanceUnit === LocalDistanceUnit.MILES ? '-32s/mile' : '-20s/km',
              icon: <Clock className="h-4 w-4" />
            }}
            dataKey="pace"
            xAxisKey="week"
            height={300}
            distanceUnit={getUnitLabel(distanceUnit)}
            paceUnit={getPaceUnitLabel(distanceUnit)}
          />
        </div>

        {/* Workout Types - Pie Chart */}
        <div className="animate-slide-down" style={{ animationDelay: '300ms' }}>
          <ProgressChart
            data={workoutTypeData}
            type="pie"
            config={chartConfigs.workoutTypes!}
            dataKey="distance"
            xAxisKey="date"
            height={300}
          />
        </div>

        {/* Training Consistency - Bar Chart */}
        <div className="animate-slide-down" style={{ animationDelay: '400ms' }}>
          <ProgressChart
            data={weeklyDistanceData.slice(-8)} // Last 8 weeks for consistency view
            type="bar"
            config={{
              title: 'Training Consistency',
              description: 'Weekly training volume',
              color: '#8b5cf6',
              trend: 'up',
              trendValue: '+8%',
              icon: <BarChart3 className="h-4 w-4" />,
            }}
            dataKey="distance"
            xAxisKey="date"
            height={300}
            distanceUnit={getUnitLabel(distanceUnit)}
            paceUnit={getPaceUnitLabel(distanceUnit)}
          />
        </div>
      </div>

      {/* Minimal Charts Section */}
      <div className="space-y-6 animate-slide-down" style={{ animationDelay: '500ms' }}>
        <div className="space-y-2">
          <h3 className="heading-3">Quick Overview</h3>
          <p className="body-base text-muted-foreground">Recent training trends at a glance</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-enhanced p-4 space-y-3">
            <h4 className="body-small font-medium text-muted-foreground">Distance Trend</h4>
            <ProgressChart
              data={weeklyDistanceData.slice(-6)}
              type="area"
              config={chartConfigs.distance!}
              dataKey="distance"
              xAxisKey="date"
              height={120}
              variant="minimal"
              showGrid={false}
            />
          </Card>
          <Card className="card-enhanced p-4 space-y-3">
            <h4 className="body-small font-medium text-muted-foreground">Pace Progress</h4>
            <ProgressChart
              data={paceProgressData.slice(-6)}
              type="line"
              config={chartConfigs.pace!}
              dataKey="pace"
              xAxisKey="date"
              height={120}
              variant="minimal"
              showGrid={false}
            />
          </Card>
          <Card className="card-enhanced p-4 space-y-3">
            <h4 className="body-small font-medium text-muted-foreground">Workout Types</h4>
            <ProgressChart
              data={workoutTypeData}
              type="pie"
              config={chartConfigs.workoutTypes!}
              dataKey="distance"
              xAxisKey="date"
              height={120}
              variant="minimal"
              showGrid={false}
            />
          </Card>
        </div>
      </div>
    </div>
  );
} 