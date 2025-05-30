import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { ProgressChart, type ProgressDataPoint, type ChartConfig } from '../ProgressChart';
import { TestWrapper } from '@/test/setup';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  AreaChart: ({ children, ...props }: any) => (
    <div data-testid="area-chart" {...props}>
      {children}
    </div>
  ),
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>
      {children}
    </div>
  ),
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  Area: (props: any) => <div data-testid="area" {...props} />,
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  Pie: ({ children, ...props }: any) => (
    <div data-testid="pie" {...props}>
      {children}
    </div>
  ),
  Cell: (props: any) => <div data-testid="cell" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props} />,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props} />,
  TrendingDown: (props: any) => <div data-testid="trending-down-icon" {...props} />,
  Activity: (props: any) => <div data-testid="activity-icon" {...props} />,
  Clock: (props: any) => <div data-testid="clock-icon" {...props} />,
  Target: (props: any) => <div data-testid="target-icon" {...props} />,
}));

// Helper function to render with wrapper
const renderWithWrapper = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('ProgressChart', () => {
  const mockData: ProgressDataPoint[] = [
    { date: '2024-01-01', distance: 5.2, pace: 5.5, duration: 28 },
    { date: '2024-01-02', distance: 8.1, pace: 5.8, duration: 47 },
    { date: '2024-01-03', distance: 3.5, pace: 5.2, duration: 18 },
    { date: '2024-01-04', distance: 10.0, pace: 6.0, duration: 60 },
  ];

  const mockConfig: ChartConfig = {
    title: 'Distance Progress',
    description: 'Weekly running distance',
    color: '#3b82f6',
    trend: 'up',
    trendValue: '+12%',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders chart with basic props', () => {
      render(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
        />
      );
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByText('Distance Progress')).toBeInTheDocument();
    });

    it('renders with different chart types', () => {
      const { rerender } = render(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      rerender(
        <ProgressChart data={mockData} config={mockConfig} type="area" dataKey="distance" />
      );
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();

      rerender(
        <ProgressChart data={mockData} config={mockConfig} type="bar" dataKey="distance" />
      );
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

      rerender(
        <ProgressChart data={mockData} config={mockConfig} type="pie" dataKey="distance" />
      );
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const { rerender } = render(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" variant="default" />
      );
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();

      rerender(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" variant="minimal" />
      );
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('renders config title and description', () => {
      render(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      
      expect(screen.getByText('Distance Progress')).toBeInTheDocument();
      expect(screen.getByText('Weekly running distance')).toBeInTheDocument();
    });

    it('renders trend indicator when provided', () => {
      render(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
      expect(screen.getByText('+12%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithWrapper(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      
      const chartContainer = screen.getByRole('img', { name: /distance progress/i });
      expect(chartContainer).toBeInTheDocument();
      expect(chartContainer).toHaveAttribute('tabIndex', '0');
      expect(chartContainer).toHaveAttribute('aria-labelledby');
      expect(chartContainer).toHaveAttribute('aria-describedby');
    });

    it('provides accessible data summary', () => {
      render(<ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />);
      
      // Check for screen reader content
      const summary = screen.getByText(/Chart showing 4 data points/);
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveClass('sr-only');
    });

    it('supports keyboard navigation', () => {
      renderWithWrapper(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      
      const chartContainer = screen.getByRole('img', { name: /distance progress/i });
      chartContainer.focus();
      expect(chartContainer).toHaveFocus();
      
      // Test keyboard interaction
      fireEvent.keyDown(chartContainer, { key: 'Enter' });
      expect(chartContainer).toHaveFocus();
    });

    it('has proper heading hierarchy', () => {
      renderWithWrapper(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Distance Progress');
      expect(title).toHaveAttribute('id');
    });

    it('provides live region for dynamic updates', () => {
      renderWithWrapper(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      
      const liveRegion = screen.getByText(/Chart showing 4 data points/);
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Data Handling', () => {
    it('handles empty data gracefully', () => {
      render(<ProgressChart data={[]} config={mockConfig} type="line" dataKey="distance" />);
      
      expect(screen.getByText(/No data available/)).toBeInTheDocument();
    });

    it('handles different data keys', () => {
      const { rerender } = render(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />
      );
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();

      rerender(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="pace" />
      );
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();

      rerender(
        <ProgressChart data={mockData} config={mockConfig} type="line" dataKey="duration" />
      );
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('calculates correct data summary', () => {
      render(<ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />);
      
      const summary = screen.getByText(/Minimum: 3\.5 kilometers.*Maximum: 10\.0 kilometers/);
      expect(summary).toBeInTheDocument();
    });
  });

  describe('Chart Customization', () => {
    it('applies custom height', () => {
      render(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          height={400} 
        />
      );
      
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('height', '400');
    });

    it('applies custom className', () => {
      render(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          className="custom-chart" 
        />
      );
      
      const card = screen.getByText('Distance Progress').closest('.custom-chart');
      expect(card).toBeInTheDocument();
    });

    it('shows/hides grid based on prop', () => {
      const { rerender } = render(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          showGrid={true} 
        />
      );
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();

      rerender(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          showGrid={false} 
        />
      );
      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
    });

    it('shows/hides tooltip based on prop', () => {
      const { rerender } = render(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          showTooltip={true} 
        />
      );
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();

      rerender(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          showTooltip={false} 
        />
      );
      expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
    });

    it('shows/hides legend based on prop', () => {
      const { rerender } = render(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          showLegend={true} 
        />
      );
      expect(screen.getByTestId('legend')).toBeInTheDocument();

      rerender(
        <ProgressChart 
          data={mockData} 
          config={mockConfig} 
          type="line" 
          dataKey="distance" 
          showLegend={false} 
        />
      );
      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('displays upward trend correctly', () => {
      const configWithUpTrend = { ...mockConfig, trend: 'up' as const, trendValue: '+15%' };
      render(<ProgressChart data={mockData} config={configWithUpTrend} type="line" dataKey="distance" />);
      
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    it('displays downward trend correctly', () => {
      const configWithDownTrend = { ...mockConfig, trend: 'down' as const, trendValue: '-8%' };
      render(<ProgressChart data={mockData} config={configWithDownTrend} type="line" dataKey="distance" />);
      
      expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
      expect(screen.getByText('-8%')).toBeInTheDocument();
    });

    it('displays neutral trend correctly', () => {
      const configWithNeutralTrend = { ...mockConfig, trend: 'neutral' as const, trendValue: '0%' };
      render(<ProgressChart data={mockData} config={configWithNeutralTrend} type="line" dataKey="distance" />);
      
      expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('hides trend when not provided', () => {
      const configWithoutTrend = { ...mockConfig, trend: undefined, trendValue: undefined };
      render(<ProgressChart data={mockData} config={configWithoutTrend} type="line" dataKey="distance" />);
      
      expect(screen.queryByTestId('trending-up-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('trending-down-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('activity-icon')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing data gracefully', () => {
      render(<ProgressChart data={[]} config={mockConfig} type="line" dataKey="distance" />);
      
      expect(screen.getByText(/No data available/)).toBeInTheDocument();
    });

    it('handles invalid chart type gracefully', () => {
      expect(() => {
        renderWithWrapper(
          <ProgressChart 
            data={mockData} 
            config={mockConfig} 
            type={'invalid' as any} 
            dataKey="distance" 
          />
        );
      }).not.toThrow();
      
      // Should render without crashing, even if chart content is not displayed
    });

    it('handles missing config properties', () => {
      const minimalConfig = { title: 'Test Chart', color: '#000000' };
      render(<ProgressChart data={mockData} config={minimalConfig} type="line" dataKey="distance" />);
      
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });
  });

  describe('Tooltip Functionality', () => {
    it('renders custom tooltip content', () => {
      render(<ProgressChart data={mockData} config={mockConfig} type="line" dataKey="distance" />);
      
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('formats different data types correctly in tooltip', () => {
      // This would require more complex mocking of Recharts tooltip behavior
      // For now, we just verify the tooltip component is rendered
      render(<ProgressChart data={mockData} config={mockConfig} type="line" dataKey="pace" />);
      
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });
}); 