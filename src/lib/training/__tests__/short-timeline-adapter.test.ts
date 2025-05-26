import { 
  assessTimelineViability, 
  generateShortTimelinePlan,
  requiresShortTimelineHandling,
  getRecommendedMinimumTimeline,
  getAbsoluteMinimumTimeline
} from '../short-timeline-adapter';
import { DistanceUnit, PaceFormat } from '../../../generated/prisma';
import { TrainingPreferences } from '@/types/training';
import { addWeeks } from 'date-fns';
import { describe, test, expect } from 'vitest';

const basePreferences: TrainingPreferences = {
  distanceUnit: DistanceUnit.MILES,
  paceFormat: PaceFormat.MIN_PER_MILE,
  workoutDays: [1, 3, 6]
};

const goalMarathonTime = '3:30:00';

describe('Timeline Assessment', () => {
  test('should identify when short timeline handling is required', () => {
    const startDate = new Date('2024-01-01');
    
    // 12 weeks - should require short timeline
    const raceDate12 = addWeeks(startDate, 12);
    expect(requiresShortTimelineHandling(startDate, raceDate12)).toBe(true);
    
    // 14 weeks - should not require short timeline
    const raceDate14 = addWeeks(startDate, 14);
    expect(requiresShortTimelineHandling(startDate, raceDate14)).toBe(false);
    
    // 16 weeks - should not require short timeline
    const raceDate16 = addWeeks(startDate, 16);
    expect(requiresShortTimelineHandling(startDate, raceDate16)).toBe(false);
  });

  test('should assess timeline viability correctly', () => {
    const startDate = new Date('2024-01-01');
    
    // 12 weeks - compress strategy
    const raceDate12 = addWeeks(startDate, 12);
    const assessment12 = assessTimelineViability(startDate, raceDate12);
    expect(assessment12.isViable).toBe(true);
    expect(assessment12.adaptationStrategy).toBe('compress');
    
    // 8 weeks - prioritize strategy
    const raceDate8 = addWeeks(startDate, 8);
    const assessment8 = assessTimelineViability(startDate, raceDate8);
    expect(assessment8.isViable).toBe(true);
    expect(assessment8.adaptationStrategy).toBe('prioritize');
    
    // 5 weeks - minimal strategy
    const raceDate5 = addWeeks(startDate, 5);
    const assessment5 = assessTimelineViability(startDate, raceDate5);
    expect(assessment5.isViable).toBe(true);
    expect(assessment5.adaptationStrategy).toBe('minimal');
    
    // 3 weeks - defer strategy
    const raceDate3 = addWeeks(startDate, 3);
    const assessment3 = assessTimelineViability(startDate, raceDate3);
    expect(assessment3.isViable).toBe(false);
    expect(assessment3.adaptationStrategy).toBe('defer');
  });
});

describe('Minimum Timeline Calculations', () => {
  test('should return correct recommended minimum timeline', () => {
    const recommended = getRecommendedMinimumTimeline();
    expect(recommended).toBe(14); // 14 weeks recommended
  });

  test('should return correct absolute minimum timeline', () => {
    const absolute = getAbsoluteMinimumTimeline();
    expect(absolute).toBe(4); // 4 weeks absolute minimum
  });
});

describe('Compress Strategy', () => {
  test('should generate compressed plan for 12 weeks', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 12);
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    expect(plan.weeks).toBe(12);
    expect(plan.workouts.length).toBeGreaterThan(0); // Should have workouts
    expect(plan.warnings.length).toBeGreaterThan(0); // Should have warnings about compression
  });

  test('should preserve peak weeks in compressed plan', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 10);
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    // Should still include peak training weeks
    expect(plan.workouts.length).toBeGreaterThan(0);
    expect(plan.recommendations.some(rec => 
      rec.toLowerCase().includes('quality')
    )).toBe(true);
  });
});

describe('Prioritize Strategy', () => {
  test('should generate prioritized plan for 8 weeks', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 8);
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    expect(plan.weeks).toBe(8);
    expect(plan.workouts.length).toBeGreaterThan(0); // Should have workouts
    expect(plan.warnings.some(warning => 
      warning.toLowerCase().includes('compressed')
    )).toBe(true);
  });

  test('should prioritize long runs over other workouts', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 7);
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    // Should have more long runs than intervals in short timeline
    const longRuns = plan.workouts.filter(w => w.type === 'LONG_RUN');
    const intervals = plan.workouts.filter(w => w.type === 'INTERVAL_800M');
    
    expect(longRuns.length).toBeGreaterThanOrEqual(intervals.length); // Long runs prioritized
  });
});

describe('Minimal Strategy', () => {
  test('should generate minimal plan for 5 weeks', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 5);
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    expect(plan.weeks).toBe(5);
    expect(plan.workouts.length).toBeGreaterThan(0); // Should have some workouts
    expect(plan.warnings.some(warning => 
      warning.toLowerCase().includes('short')
    )).toBe(true);
  });

  test('should focus on maintenance in minimal strategy', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 4);
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    expect(plan.recommendations.some(rec => 
      rec.toLowerCase().includes('coach')
    )).toBe(true);
  });
});

describe('Defer Strategy', () => {
  test('should recommend deferring for very short timelines', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 3);
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    expect(plan.weeks).toBe(3);
    expect(plan.workouts.length).toBe(0); // No workouts for defer strategy
    expect(plan.warnings.some(warning => 
      warning.toLowerCase().includes('too short')
    )).toBe(true);
  });
});

describe('Input Validation', () => {
  test('should handle invalid date ranges', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = new Date('2023-12-01'); // Race before start
    
    const plan = generateShortTimelinePlan(
      startDate,
      raceDate,
      goalMarathonTime,
      basePreferences
    );
    
    // Should handle gracefully with negative weeks
    expect(plan.weeks).toBeLessThan(0);
    expect(plan.workouts.length).toBe(0);
  });

  test('should handle malformed marathon time', () => {
    const startDate = new Date('2024-01-01');
    const raceDate = addWeeks(startDate, 8);
    
    expect(() => {
      generateShortTimelinePlan(
        startDate,
        raceDate,
        'invalid',
        basePreferences
      );
    }).toThrow();
  });
});

describe('Performance Tests', () => {
  test('should generate short timeline plans quickly', () => {
    const startTime = Date.now();
    
    // Generate 50 short timeline plans
    for (let i = 0; i < 50; i++) {
      const startDate = new Date('2024-01-01');
      const weeks = 4 + (i % 10); // 4-13 weeks
      const raceDate = addWeeks(startDate, weeks);
      
      generateShortTimelinePlan(
        startDate,
        raceDate,
        goalMarathonTime,
        basePreferences
      );
    }
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
  });
}); 