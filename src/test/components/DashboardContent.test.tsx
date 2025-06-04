import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DashboardContent } from '@/components/DashboardContent';
import { useDashboardData, useDashboardRefresh } from '@/hooks/useDashboardData';
import userEvent from '@testing-library/user-event';

// Mock the hooks
vi.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: vi.fn(),
  useDashboardRefresh: vi.fn(),
}));

// Mock the ProgressChart component
vi.mock('@/components/training', () => ({
  ProgressChart: ({ className }: { className?: string }) => (
    <div className={className} data-testid="progress-chart">
      Progress Chart Component
    </div>
  ),
}));

// Mock the CustomButton component
vi.mock('@/components/CustomButton', () => ({
  CustomButton: ({ children, onClick, leftIcon: Icon, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {Icon && <Icon data-testid="button-icon" />}
      {children}
    </button>
  ),
}));

// Mock the Spinner component
vi.mock('@/components/Spinner', () => ({
  Spinner: ({ className }: { className?: string }) => (
    <div className={className} data-testid="spinner">Loading...</div>
  ),
}));

describe('DashboardContent', () => {
  const mockRefreshDashboard = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useDashboardRefresh as any).mockReturnValue({
      refreshDashboard: mockRefreshDashboard,
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', () => {
      (useDashboardData as any).mockReturnValue({
        isLoading: true,
        error: null,
      });

      render(<DashboardContent />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading your training dashboard...')).toBeInTheDocument();
    });

    it('should have proper accessibility attributes during loading', () => {
      (useDashboardData as any).mockReturnValue({
        isLoading: true,
        error: null,
      });

      render(<DashboardContent />);

      const loadingContainer = screen.getByText('Loading your training dashboard...').closest('div');
      expect(loadingContainer).toHaveClass('text-center');
    });
  });

  describe('Error State', () => {
    it('should display error message when there is an error', () => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: 'Failed to load dashboard data',
      });

      render(<DashboardContent />);

      expect(screen.getByText('Unable to load dashboard')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should display error icon in error state', () => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: 'Failed to load dashboard data',
      });

      const { container } = render(<DashboardContent />);
      
      // Check for AlertCircle icon by looking for SVG with the correct class name
      const errorIcon = document.querySelector('svg.lucide-circle-alert');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveClass('h-12', 'w-12', 'text-destructive');
    });

    it('handles retry functionality on error', async () => {
      const user = userEvent.setup();
      
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: 'Failed to load',
      });

      render(<DashboardContent />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(mockRefreshDashboard).toHaveBeenCalledTimes(1);
    });
  });

  describe('Success State - Data Display', () => {
    beforeEach(() => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: null,
        weeksToMarathon: 8,
        trainingCompletePercentage: 65,
        peakWeeklyMiles: 45,
        thisWeekDistance: 25,
        thisWeekWorkoutsCompleted: 3,
        thisWeekTotalWorkouts: 4,
        thisWeekPlannedMileage: 30,
        thisWeekGoalProgress: 75,
        daysToMarathon: 56,
        currentWeek: 6,
        marathonDate: new Date('2024-06-15'),
      });
    });

    it('should display training overview metrics correctly', () => {
      render(<DashboardContent />);
      
      // Training overview metrics
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Weeks to Race Day')).toBeInTheDocument();
      expect(screen.getByText('6/14/2024')).toBeInTheDocument();

      // Training completion percentage
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('Training Complete')).toBeInTheDocument();

      // Peak weekly miles
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Peak Weekly Miles')).toBeInTheDocument();
    });

    it('should display this week summary correctly', () => {
      render(<DashboardContent />);

      // This week metrics
      expect(screen.getByText('25 mi')).toBeInTheDocument();
      expect(screen.getByText('Total Mileage')).toBeInTheDocument();
      
      expect(screen.getByText('3 of 4')).toBeInTheDocument();
      expect(screen.getByText('Workouts')).toBeInTheDocument();
      
      expect(screen.getByText('56')).toBeInTheDocument();
      expect(screen.getByText('Days to Race Day')).toBeInTheDocument();
      
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Goal Progress')).toBeInTheDocument();
      
      expect(screen.getByText('Week 6')).toBeInTheDocument();
    });

    it('should display main dashboard title and description', () => {
      render(<DashboardContent />);

      expect(screen.getByText('Marathon Training Dashboard')).toBeInTheDocument();
    });

    it('should display section headings with icons', () => {
      render(<DashboardContent />);

      expect(screen.getByText('Training Overview')).toBeInTheDocument();
      expect(screen.getByText('This Week Summary')).toBeInTheDocument();
    });

    it('should render ProgressChart component', () => {
      render(<DashboardContent />);

      expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Data Variations', () => {
    it('should handle null marathon date gracefully', () => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: null,
        weeksToMarathon: null,
        trainingCompletePercentage: 0,
        peakWeeklyMiles: 0,
        thisWeekDistance: 0,
        thisWeekWorkoutsCompleted: 0,
        thisWeekTotalWorkouts: 0,
        thisWeekPlannedMileage: 0,
        thisWeekGoalProgress: 0,
        daysToMarathon: 0,
        currentWeek: 1,
        marathonDate: null,
      });

      render(<DashboardContent />);

      // Should show N/A for weeks to marathon when null
      const weekElements = screen.getAllByText('N/A');
      expect(weekElements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/\/\d+\/\d+/)).not.toBeInTheDocument();
    });

    it('should handle singular week text correctly', () => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: null,
        weeksToMarathon: 1,
        trainingCompletePercentage: 90,
        peakWeeklyMiles: 20,
        thisWeekDistance: 15,
        thisWeekWorkoutsCompleted: 4,
        thisWeekTotalWorkouts: 4,
        thisWeekPlannedMileage: 20,
        thisWeekGoalProgress: 100,
        daysToMarathon: 7,
        currentWeek: 16,
        marathonDate: new Date('2024-01-15'),
      });

      render(<DashboardContent />);

      expect(screen.getByText('Week to Race Day')).toBeInTheDocument();
    });

    it('should handle zero values appropriately', () => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: null,
        weeksToMarathon: null,
        trainingCompletePercentage: 0,
        peakWeeklyMiles: 0,
        thisWeekDistance: 0,
        thisWeekWorkoutsCompleted: 0,
        thisWeekTotalWorkouts: 0,
        thisWeekPlannedMileage: 0,
        thisWeekGoalProgress: 0,
        daysToMarathon: 0,
        currentWeek: 1,
        marathonDate: new Date('2023-12-31'),
      });

      render(<DashboardContent />);

      // Check for zero values in training overview
      const trainingSection = screen.getByText('Training Overview').closest('div');
      expect(trainingSection).toBeInTheDocument();
      
      // Check for zero values in this week summary
      expect(screen.getByText('0 mi')).toBeInTheDocument();
      expect(screen.getByText('0 of 0')).toBeInTheDocument();
      
      // Check for weeks to marathon N/A
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Layout', () => {
    beforeEach(() => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: null,
        weeksToMarathon: 10,
        trainingCompletePercentage: 50,
        peakWeeklyMiles: 30,
        thisWeekDistance: 20,
        thisWeekWorkoutsCompleted: 2,
        thisWeekTotalWorkouts: 3,
        thisWeekPlannedMileage: 25,
        thisWeekGoalProgress: 67,
        daysToMarathon: 70,
        currentWeek: 5,
        marathonDate: new Date('2024-03-15'),
      });
    });

    it('should have proper container styling', () => {
      render(<DashboardContent />);

      const mainContainer = document.querySelector('.container-enhanced.py-0');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have proper animation classes', () => {
      render(<DashboardContent />);

      const animatedElements = document.querySelectorAll('.animate-slide-down, .animate-fade-in-up');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should have proper grid layouts for metrics', () => {
      render(<DashboardContent />);

      const trainingGrid = document.querySelector('.grid.gap-6.md\\:grid-cols-3');
      const weeklyGrid = document.querySelector('.grid.gap-6.md\\:grid-cols-4');
      
      expect(trainingGrid).toBeInTheDocument();
      expect(weeklyGrid).toBeInTheDocument();
    });

    it('should have proper progress bar styling', () => {
      render(<DashboardContent />);

      const progressBars = document.querySelectorAll('.progress-bar');
      expect(progressBars.length).toBeGreaterThan(0);
      
      // Check that progress bars have style attributes
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute('style');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: null,
        weeksToMarathon: 12,
        trainingCompletePercentage: 40,
        peakWeeklyMiles: 35,
        thisWeekDistance: 18,
        thisWeekWorkoutsCompleted: 1,
        thisWeekTotalWorkouts: 3,
        thisWeekPlannedMileage: 20,
        thisWeekGoalProgress: 33,
        daysToMarathon: 84,
        currentWeek: 4,
        marathonDate: new Date('2024-04-20'),
      });
    });

    it('should have proper heading hierarchy', () => {
      render(<DashboardContent />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1).toBeInTheDocument();
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('should have accessible button labels', () => {
      render(<DashboardContent />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(<DashboardContent />);

      // Check for proper use of headings and sections
      expect(screen.getByText('Marathon Training Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Training Overview')).toBeInTheDocument();
      expect(screen.getByText('This Week Summary')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      (useDashboardData as any).mockReturnValue({
        isLoading: false,
        error: null,
        weeksToMarathon: 6,
        trainingCompletePercentage: 75,
        peakWeeklyMiles: 40,
        thisWeekDistance: 22,
        thisWeekWorkoutsCompleted: 3,
        thisWeekTotalWorkouts: 4,
        thisWeekPlannedMileage: 25,
        thisWeekGoalProgress: 75,
        daysToMarathon: 42,
        currentWeek: 8,
        marathonDate: new Date('2024-05-10'),
      });
    });

    it('should hide refresh button on mobile', () => {
      render(<DashboardContent />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toHaveClass('hidden', 'md:flex');
    });

    it('should have responsive grid classes', () => {
      render(<DashboardContent />);
      
      const responsiveGrids = document.querySelectorAll('.md\\:grid-cols-3, .md\\:grid-cols-4');
      expect(responsiveGrids.length).toBeGreaterThan(0);
    });
  });
}); 