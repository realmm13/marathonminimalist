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
  Heart,
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

// Sample data for different chart types
const weeklyDistanceData: ProgressDataPoint[] = [
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
];

const paceProgressData: ProgressDataPoint[] = [
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
];

const workoutTypeData: ProgressDataPoint[] = [
  { date: 'Easy Runs', distance: 45, week: 1 },
  { date: 'Tempo Runs', distance: 25, week: 2 },
  { date: 'Intervals', distance: 15, week: 3 },
  { date: 'Long Runs', distance: 15, week: 4 },
];

const effortData: ProgressDataPoint[] = [
  { date: 'Week 1', effort: 6, week: 1 },
  { date: 'Week 2', effort: 6.5, week: 2 },
  { date: 'Week 3', effort: 7, week: 3 },
  { date: 'Week 4', effort: 6.5, week: 4 },
  { date: 'Week 5', effort: 7.5, week: 5 },
  { date: 'Week 6', effort: 8, week: 6 },
  { date: 'Week 7', effort: 8.5, week: 7 },
  { date: 'Week 8', effort: 7.5, week: 8 },
  { date: 'Week 9', effort: 8.5, week: 9 },
  { date: 'Week 10', effort: 9, week: 10 },
  { date: 'Week 11', effort: 6, week: 11 },
  { date: 'Week 12', effort: 5, week: 12 },
];

const heartRateData: ProgressDataPoint[] = [
  { date: 'Week 1', heartRate: 155, week: 1 },
  { date: 'Week 2', heartRate: 152, week: 2 },
  { date: 'Week 3', heartRate: 150, week: 3 },
  { date: 'Week 4', heartRate: 148, week: 4 },
  { date: 'Week 5', heartRate: 147, week: 5 },
  { date: 'Week 6', heartRate: 145, week: 6 },
  { date: 'Week 7', heartRate: 143, week: 7 },
  { date: 'Week 8', heartRate: 142, week: 8 },
  { date: 'Week 9', heartRate: 140, week: 9 },
  { date: 'Week 10', heartRate: 138, week: 10 },
  { date: 'Week 11', heartRate: 140, week: 11 },
  { date: 'Week 12', heartRate: 142, week: 12 },
];

export function ProgressDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('12weeks');

  const chartConfigs: Record<string, ChartConfig> = {
    distance: {
      title: 'Weekly Distance',
      description: 'Total kilometers per week',
      color: '#3b82f6',
      trend: 'up',
      trendValue: '+15.2%',
      icon: <Activity className="h-4 w-4" />,
    },
    pace: {
      title: 'Average Pace Improvement',
      description: 'Minutes per kilometer',
      color: '#10b981',
      trend: 'down',
      trendValue: '-20s/km',
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
    effort: {
      title: 'Perceived Effort',
      description: 'RPE scale (1-10)',
      color: '#ef4444',
      trend: 'up',
      trendValue: '+1.5 avg',
      icon: <Zap className="h-4 w-4" />,
    },
    heartRate: {
      title: 'Average Heart Rate',
      description: 'Beats per minute during runs',
      color: '#8b5cf6',
      trend: 'down',
      trendValue: '-17 bpm',
      icon: <Heart className="h-4 w-4" />,
    },
  };

  const summaryStats = [
    {
      label: 'Total Distance',
      value: '420 km',
      change: '+15.2%',
      trend: 'up' as const,
      icon: <Activity className="h-5 w-5" />,
    },
    {
      label: 'Best Pace',
      value: '4:24/km',
      change: '-32s',
      trend: 'down' as const,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      label: 'Workouts',
      value: '48',
      change: '+12',
      trend: 'up' as const,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: 'Avg HR',
      value: '145 bpm',
      change: '-17',
      trend: 'down' as const,
      icon: <Heart className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training Progress</h2>
          <p className="text-muted-foreground">
            Track your marathon training journey
          </p>
        </div>
        <SegmentedControl
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          options={[
            { label: '4 Weeks', value: '4weeks' },
            { label: '12 Weeks', value: '12weeks' },
            { label: '6 Months', value: '6months' },
          ]}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-primary/10">
                {stat.icon}
              </div>
              <Badge 
                color={stat.trend === 'up' ? 'green' : stat.trend === 'down' ? 'blue' : 'gray'}
                className={
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-800' 
                    : stat.trend === 'down' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {stat.change}
              </Badge>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Distance - Area Chart */}
        <ProgressChart
          data={weeklyDistanceData}
          type="area"
          config={chartConfigs.distance!}
          dataKey="distance"
          xAxisKey="date"
          height={300}
        />

        {/* Pace Progress - Line Chart */}
        <ProgressChart
          data={paceProgressData}
          type="line"
          config={chartConfigs.pace!}
          dataKey="pace"
          xAxisKey="date"
          height={300}
        />

        {/* Workout Types - Pie Chart */}
        <ProgressChart
          data={workoutTypeData}
          type="pie"
          config={chartConfigs.workoutTypes!}
          dataKey="distance"
          xAxisKey="date"
          height={300}
        />

        {/* Effort Tracking - Bar Chart */}
        <ProgressChart
          data={effortData}
          type="bar"
          config={chartConfigs.effort!}
          dataKey="effort"
          xAxisKey="date"
          height={300}
        />
      </div>

      {/* Heart Rate Trend - Full Width */}
      <ProgressChart
        data={heartRateData}
        type="line"
        config={chartConfigs.heartRate!}
        dataKey="heartRate"
        xAxisKey="date"
        height={250}
        className="col-span-full"
      />

      {/* Minimal Charts Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Overview</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Distance Trend</h4>
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
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Pace Progress</h4>
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
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Effort Level</h4>
            <ProgressChart
              data={effortData.slice(-6)}
              type="bar"
              config={chartConfigs.effort!}
              dataKey="effort"
              xAxisKey="date"
              height={120}
              variant="minimal"
              showGrid={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 