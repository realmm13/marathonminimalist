'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Spinner } from '@/components/Spinner';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { api } from '@/trpc/react';
import { Calendar, TrendingUp, Activity, Clock } from 'lucide-react';

// Types for chart data
interface ChartDataPoint {
  date: string;
  week: string;
  completionRate: number;
  averagePace?: number;
  totalDistance: number;
  workoutCount: number;
  averageDuration?: number;
}

interface ProgressChartProps {
  className?: string;
}

type MetricType = 'completion' | 'pace' | 'distance' | 'duration';
type TimeRange = '7d' | '30d' | '3m' | '1y';

const metricOptions = [
  { value: 'completion' as MetricType, label: 'Completion Rate', icon: TrendingUp },
  { value: 'pace' as MetricType, label: 'Pace Trends', icon: Activity },
  { value: 'distance' as MetricType, label: 'Distance', icon: Calendar },
  { value: 'duration' as MetricType, label: 'Duration', icon: Clock },
];

const timeRangeOptions = [
  { value: '7d' as TimeRange, label: '7 Days' },
  { value: '30d' as TimeRange, label: '30 Days' },
  { value: '3m' as TimeRange, label: '3 Months' },
  { value: '1y' as TimeRange, label: '1 Year' },
];

// Utility function to safely parse pace strings
const parsePaceToSeconds = (pace: string): number | null => {
  try {
    const parts = pace.split(':');
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
};

export function ProgressChart({ className }: ProgressChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('completion');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');

  // Type-safe wrapper functions for SegmentedControl
  const handleMetricChange = (value: string) => {
    setSelectedMetric(value as MetricType);
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value as TimeRange);
  };

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const endDate = new Date();
    let startDate: Date;

    switch (selectedTimeRange) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '1y':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subDays(endDate, 30);
    }

    return { startDate, endDate };
  }, [selectedTimeRange]);

  // Fetch workout completions data
  const { data: completionsData, isLoading } = api.training.getWorkoutCompletions.useQuery({
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
  });

  // Process data for charts
  const chartData = useMemo(() => {
    if (!completionsData?.completions) return [];

    // Group completions by week for better visualization
    const weeks = eachWeekOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate,
    });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const weekCompletions = completionsData.completions.filter(completion => {
        const completedDate = new Date(completion.completedAt);
        return completedDate >= weekStart && completedDate <= weekEnd;
      });

      // Calculate metrics for this week
      const workoutCount = weekCompletions.length;
      const totalDistance = weekCompletions.reduce((sum, c) => sum + (c.actualDistance || 0), 0);
      const totalDuration = weekCompletions.reduce((sum, c) => sum + (c.actualDuration || 0), 0);
      
      // Calculate average pace (convert pace string to seconds for averaging)
      const validPaces = weekCompletions
        .map(c => c.actualPace)
        .filter(Boolean)
        .map(pace => parsePaceToSeconds(pace!))
        .filter((pace): pace is number => pace !== null);
      
      const averagePace = validPaces.length > 0 
        ? validPaces.reduce((sum, pace) => sum + pace, 0) / validPaces.length
        : undefined;

      // Estimate completion rate (assuming 3 workouts per week as target)
      const targetWorkouts = 3;
      const completionRate = Math.min((workoutCount / targetWorkouts) * 100, 100);

      return {
        date: format(weekStart, 'MMM dd'),
        week: format(weekStart, 'MMM dd'),
        completionRate,
        averagePace,
        totalDistance,
        workoutCount,
        averageDuration: totalDuration > 0 ? totalDuration / workoutCount : undefined,
      };
    });
  }, [completionsData, dateRange]);

  // Format pace for display (convert seconds back to MM:SS)
  const formatPace = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{`Week of ${label}`}</p>
          {selectedMetric === 'completion' && (
            <p className="text-blue-600 dark:text-blue-400">
              {`Completion Rate: ${data.completionRate.toFixed(1)}%`}
            </p>
          )}
          {selectedMetric === 'pace' && data.averagePace && (
            <p className="text-green-600 dark:text-green-400">
              {`Average Pace: ${formatPace(data.averagePace)}/mile`}
            </p>
          )}
          {selectedMetric === 'distance' && (
            <p className="text-purple-600 dark:text-purple-400">
              {`Total Distance: ${data.totalDistance.toFixed(1)} miles`}
            </p>
          )}
          {selectedMetric === 'duration' && data.averageDuration && (
            <p className="text-orange-600 dark:text-orange-400">
              {`Average Duration: ${data.averageDuration.toFixed(0)} min`}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {`Workouts: ${data.workoutCount}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render appropriate chart based on selected metric
  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      );
    }

    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No workout data available for this time period</p>
            <p className="text-sm">Complete some workouts to see your progress!</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (selectedMetric) {
      case 'completion':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pace':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={formatPace}
                label={{ value: 'Pace (min/mile)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="averagePace" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'distance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'Distance (miles)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="totalDistance" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'duration':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="averageDuration" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Transform data for chart display
  const transformedData = chartData?.length > 0 ? chartData[0] : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-lg font-semibold">Training Progress</CardTitle>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <SegmentedControl
              options={timeRangeOptions}
              value={selectedTimeRange}
              onChange={handleTimeRangeChange}
              size="sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <SegmentedControl
            options={metricOptions.map(option => ({
              value: option.value,
              label: option.label,
            }))}
            value={selectedMetric}
            onChange={handleMetricChange}
            size="sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
} 