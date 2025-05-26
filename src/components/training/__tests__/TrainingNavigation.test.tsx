import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TrainingNavigation } from '../TrainingNavigation';

// Mock Next.js navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock KitzeUI
vi.mock('@/components/KitzeUI', () => ({
  useKitzeUI: () => ({ isMobile: false }),
}));

describe('TrainingNavigation', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUsePathname.mockReturnValue('/app');
  });

  describe('Rendering', () => {
    it('renders navigation with training links', () => {
      render(<TrainingNavigation />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /workouts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /progress/i })).toBeInTheDocument();
    });

    it('renders with proper navigation structure', () => {
      render(<TrainingNavigation />);
      
      const nav = screen.getByRole('navigation');
      const list = screen.getByRole('list');
      const listItems = screen.getAllByRole('listitem');
      
      expect(nav).toContainElement(list);
      expect(listItems).toHaveLength(3);
    });
  });

  describe('Active State Management', () => {
    it('marks dashboard as active when on /app path', () => {
      mockUsePathname.mockReturnValue('/app');
      render(<TrainingNavigation />);
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard.*current page/i });
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('marks progress as active when on progress path', () => {
      mockUsePathname.mockReturnValue('/progress-demo');
      render(<TrainingNavigation />);
      
      const progressLink = screen.getByRole('link', { name: /progress.*current page/i });
      expect(progressLink).toHaveAttribute('aria-current', 'page');
    });

    it('marks workouts as active when on workout path', () => {
      mockUsePathname.mockReturnValue('/workout-demo');
      render(<TrainingNavigation />);
      
      const workoutsLink = screen.getByRole('link', { name: /workouts.*current page/i });
      expect(workoutsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<TrainingNavigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Training navigation');
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('uses aria-current for active page', () => {
      mockUsePathname.mockReturnValue('/progress-demo');
      render(<TrainingNavigation />);
      
      const progressLink = screen.getByRole('link', { name: /progress.*current page/i });
      expect(progressLink).toHaveAttribute('aria-current', 'page');
    });

    it('provides descriptive link text with current page indicator', () => {
      mockUsePathname.mockReturnValue('/workout-demo');
      render(<TrainingNavigation />);
      
      const workoutsLink = screen.getByRole('link', { name: /workouts.*current page/i });
      expect(workoutsLink).toHaveAttribute('aria-current', 'page');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TrainingNavigation />);
      
      const firstLink = screen.getByRole('link', { name: /dashboard/i });
      await user.tab();
      expect(firstLink).toHaveFocus();
    });
  });

  describe('Styling Variants', () => {
    it('applies correct classes for horizontal variant', () => {
      render(<TrainingNavigation variant="horizontal" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('applies correct classes for vertical variant', () => {
      render(<TrainingNavigation variant="vertical" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex', 'flex-col', 'space-y-2');
    });

    it('applies correct classes for compact variant', () => {
      render(<TrainingNavigation variant="compact" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex', 'items-center', 'space-x-1');
    });

    it('applies active state styling', () => {
      mockUsePathname.mockReturnValue('/workout-demo');
      render(<TrainingNavigation />);
      
      const workoutsLink = screen.getByRole('link', { name: /workouts.*current page/i });
      expect(workoutsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<TrainingNavigation className="custom-nav" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-nav');
    });

    it('defaults to horizontal variant', () => {
      render(<TrainingNavigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('Link Behavior', () => {
    it('renders proper href attributes', () => {
      render(<TrainingNavigation />);
      
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/app');
      expect(screen.getByRole('link', { name: /workouts/i })).toHaveAttribute('href', '/workout-demo');
      expect(screen.getByRole('link', { name: /progress/i })).toHaveAttribute('href', '/progress-demo');
    });
  });

  describe('Error Handling', () => {
    it('handles missing pathname gracefully', () => {
      mockUsePathname.mockReturnValue('');
      
      expect(() => render(<TrainingNavigation />)).not.toThrow();
    });

    it('handles invalid pathname gracefully', () => {
      mockUsePathname.mockReturnValue(null as any);
      
      expect(() => render(<TrainingNavigation />)).not.toThrow();
    });
  });
}); 