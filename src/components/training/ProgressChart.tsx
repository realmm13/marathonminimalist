'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useId, useMemo } from 'react';

export interface ProgressDataPoint {
  date: string;
  distance?: number;
  pace?: number;
  duration?: number;
  heartRate?: number;
  effort?: number;
  week?: number;
}

export interface ChartConfig {
  title: string;
  description?: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
}

export interface ProgressChartProps {
  data: ProgressDataPoint[];
  type: 'line' | 'area' | 'bar' | 'pie';
  config: ChartConfig;
  dataKey: keyof ProgressDataPoint;
  xAxisKey?: keyof ProgressDataPoint;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  distanceUnit?: 'km' | 'mi';
  paceUnit?: '/km' | '/mi';
}

const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  muted: '#6b7280',
};

const formatTooltipValue = (value: any, name: string, distanceUnit = 'km', paceUnit = '/km') => {
  switch (name) {
    case 'pace':
      return [`${value} min${paceUnit}`, 'Pace'];
    case 'distance':
      return [`${value} ${distanceUnit}`, 'Distance'];
    case 'duration':
      return [`${value} min`, 'Duration'];
    case 'heartRate':
      return [`${value} bpm`, 'Heart Rate'];
    case 'effort':
      return [`${value}/10`, 'Effort'];
    default:
      return [value, name];
  }
};

// Custom tooltip component with enhanced styling
const CustomTooltip = ({ active, payload, label, distanceUnit = 'km', paceUnit = '/km' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-enhanced p-3 shadow-lg border border-border/50 backdrop-blur-md">
        <p className="body-small font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const [formattedValue, formattedName] = formatTooltipValue(
            entry.value,
            entry.dataKey,
            distanceUnit,
            paceUnit
          );
          return (
            <p key={index} className="body-xs" style={{ color: entry.color }}>
              {`${formattedName}: ${formattedValue}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const TrendIndicator = ({ trend, value }: { trend?: 'up' | 'down' | 'neutral'; value?: string }) => {
  if (!trend || !value) return null;

  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Trending up' },
    down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Trending down' },
    neutral: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Stable trend' },
  };

  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full body-xs font-medium transition-all duration-200 hover-lift',
        config.bg, 
        config.color
      )}
      role="img"
      aria-label={`${config.label}: ${value}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span aria-hidden="true">{value}</span>
    </div>
  );
};

export function ProgressChart({
  data,
  type,
  config,
  dataKey,
  xAxisKey = 'date',
  height = 300,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  variant = 'default',
  distanceUnit = 'km',
  paceUnit = '/km',
}: ProgressChartProps) {
  const chartId = useId();
  const chartColor = config.color || CHART_COLORS.primary;

  // Generate accessible data summary for screen readers
  const dataSummary = useMemo(() => {
    if (!data.length) return 'No data available';
    
    const values = data.map(d => d[dataKey]).filter(v => v !== undefined) as number[];
    if (!values.length) return 'No data available';
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const formatValue = (value: number) => {
      switch (dataKey) {
        case 'pace':
          return `${value.toFixed(1)} minutes per ${paceUnit.replace('/', '')}`;
        case 'distance':
          return `${value.toFixed(1)} ${distanceUnit === 'mi' ? 'miles' : 'kilometers'}`;
        case 'duration':
          return `${value.toFixed(0)} minutes`;
        case 'heartRate':
          return `${value.toFixed(0)} beats per minute`;
        case 'effort':
          return `${value.toFixed(1)} out of 10`;
        default:
          return value.toFixed(1);
      }
    };

    return `Chart showing ${data.length} data points. Minimum: ${formatValue(min)}, Maximum: ${formatValue(max)}, Average: ${formatValue(avg)}.`;
  }, [data, dataKey, distanceUnit, paceUnit]);

  const renderChart = () => {
    const commonProps = {
      data,
      margin: variant === 'minimal' ? { top: 5, right: 5, left: 5, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={variant !== 'minimal'}
              tickLine={variant !== 'minimal'}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              axisLine={variant !== 'minimal'}
              tickLine={variant !== 'minimal'}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            {showTooltip && <Tooltip content={<CustomTooltip distanceUnit={distanceUnit} paceUnit={paceUnit} />} />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={variant !== 'minimal'}
              tickLine={variant !== 'minimal'}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              axisLine={variant !== 'minimal'}
              tickLine={variant !== 'minimal'}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            {showTooltip && <Tooltip content={<CustomTooltip distanceUnit={distanceUnit} paceUnit={paceUnit} />} />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              fill={chartColor}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={variant !== 'minimal'}
              tickLine={variant !== 'minimal'}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              axisLine={variant !== 'minimal'}
              tickLine={variant !== 'minimal'}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            {showTooltip && <Tooltip content={<CustomTooltip distanceUnit={distanceUnit} paceUnit={paceUnit} />} />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              fill={chartColor}
              dataKey={dataKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (variant === 'minimal') {
    const chart = renderChart();
    if (!chart) return null;
    
    return (
      <div className={cn('w-full', className)}>
        <div 
          className="sr-only" 
          id={`${chartId}-description`}
          aria-live="polite"
        >
          {dataSummary}
        </div>
        <div
          role="img"
          aria-labelledby={`${chartId}-title`}
          aria-describedby={`${chartId}-description`}
          tabIndex={0}
          className="focus:outline-none focus-ring rounded"
        >
          <ResponsiveContainer width="100%" height={height}>
            {chart}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  const chart = renderChart();
  if (!chart) return null;

  return (
    <Card className={cn('card-enhanced p-6 hover-lift group', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {config.icon && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300" aria-hidden="true">
              {config.icon}
            </div>
          )}
          <div className="space-y-1">
            <h3 
              id={`${chartId}-title`}
              className="heading-4 font-semibold"
            >
              {config.title}
            </h3>
            {config.description && (
              <p 
                id={`${chartId}-subtitle`}
                className="body-small text-muted-foreground"
              >
                {config.description}
              </p>
            )}
          </div>
        </div>
        <TrendIndicator trend={config.trend} value={config.trendValue} />
      </div>

      <div 
        className="sr-only" 
        id={`${chartId}-description`}
        aria-live="polite"
      >
        {dataSummary}
      </div>

      <div
        role="img"
        aria-labelledby={`${chartId}-title ${config.description ? `${chartId}-subtitle` : ''}`}
        aria-describedby={`${chartId}-description`}
        tabIndex={0}
        className="focus:outline-none focus-ring rounded"
        onKeyDown={(e) => {
          // Allow keyboard users to interact with the chart
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Focus could trigger additional chart interactions if needed
          }
        }}
      >
        <ResponsiveContainer width="100%" height={height}>
          {chart}
        </ResponsiveContainer>
      </div>
    </Card>
  );
} 