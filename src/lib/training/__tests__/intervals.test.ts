import { describe, test, expect } from 'vitest';
import { generateIntervalWorkout } from '../intervals';
import { DistanceUnit, PaceFormat } from '../../../generated/prisma';
import { TrainingPreferences } from '@/types/training';

const baseParams = {
  week: 1,
  goalMarathonTime: '3:30:00',
  preferences: {
    distanceUnit: DistanceUnit.MILES,
    paceFormat: PaceFormat.MIN_PER_MILE,
    workoutDays: [1, 3, 6]
  } as TrainingPreferences
};

describe('Interval Algorithm', () => {
  describe('Basic Functionality', () => {
    test('should generate interval workout for week 1', () => {
      const result = generateIntervalWorkout(baseParams);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('INTERVAL_800M');
      expect(result.week).toBe(1);
      expect(result.intervals[0]?.repetitions).toBe(2); // Week 1 should be 2 reps
      expect(result.description).toContain('800m');
    });

    test('should generate interval workout for peak week (week 10)', () => {
      const result = generateIntervalWorkout({ ...baseParams, week: 10 });
      
      expect(result.week).toBe(10);
      expect(result.intervals[0]?.repetitions).toBe(10); // Peak repetitions
    });

    test('should generate interval workout for taper week (week 13)', () => {
      const result = generateIntervalWorkout({ ...baseParams, week: 13 });
      
      expect(result.week).toBe(13);
      expect(result.intervals[0]?.repetitions).toBe(4); // Tapered repetitions
    });
  });

  describe('Repetition Progression', () => {
    test('should follow correct 14-week progression', () => {
      const expectedReps = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 8, 6, 4, 2];
      
      for (let week = 1; week <= 14; week++) {
        const result = generateIntervalWorkout({ ...baseParams, week });
        expect(result.intervals[0]?.repetitions).toBe(expectedReps[week - 1]);
      }
    });

    test('should handle invalid week numbers', () => {
      expect(() => {
        generateIntervalWorkout({ ...baseParams, week: 15 });
      }).toThrow();

      expect(() => {
        generateIntervalWorkout({ ...baseParams, week: 0 });
      }).toThrow();
    });
  });

  describe('Pace Calculations', () => {
    test('should calculate correct interval pace for different marathon times', () => {
      const testCases = [
        { marathonTime: '3:00:00', expectedPace: '3:00 per mile' },
        { marathonTime: '3:30:00', expectedPace: '3:30 per mile' },
        { marathonTime: '4:00:00', expectedPace: '4:00 per mile' },
        { marathonTime: '4:30:00', expectedPace: '4:30 per mile' },
        { marathonTime: '5:00:00', expectedPace: '5:00 per mile' }
      ];

      testCases.forEach(({ marathonTime, expectedPace }) => {
        const result = generateIntervalWorkout({ 
          ...baseParams, 
          goalMarathonTime: marathonTime 
        });
        expect(result.intervals[0]?.targetPace).toBe(expectedPace);
      });
    });
  });

  describe('Recovery Time Calculations', () => {
    test('should set recovery time equal to interval pace time', () => {
      const result = generateIntervalWorkout(baseParams);
      
      // For 3:30:00 marathon, recovery should be 3:30 (210 seconds)
      expect(result.intervals[0]?.recoveryTime).toBe(210); // 3:30 in seconds
    });

    test('should calculate recovery correctly for different paces', () => {
      const fastResult = generateIntervalWorkout({ 
        ...baseParams, 
        goalMarathonTime: '3:00:00' 
      });
      
      // For 3:00:00 marathon, recovery should be 3:00 (180 seconds)
      expect(fastResult.intervals[0]?.recoveryTime).toBe(180);
    });
  });

  describe('Distance Calculations', () => {
    test('should always use 800m intervals', () => {
      for (let week = 1; week <= 14; week++) {
        const result = generateIntervalWorkout({ ...baseParams, week });
        expect(result.intervals[0]?.distance).toBe(0.5); // 800m = 0.5 miles
      }
    });

    test('should convert to kilometers when requested', () => {
      const kmParams = {
        ...baseParams,
        preferences: {
          ...baseParams.preferences,
          distanceUnit: DistanceUnit.KILOMETERS
        }
      };

      const result = generateIntervalWorkout(kmParams);
      expect(result.intervals[0]?.distance).toBeCloseTo(0.8, 1); // 800m = 0.8km
    });
  });

  describe('Unit Conversions', () => {
    test('should convert pace to per km when requested', () => {
      const kmPaceParams = {
        ...baseParams,
        preferences: {
          ...baseParams.preferences,
          distanceUnit: DistanceUnit.KILOMETERS
        }
      };

      const result = generateIntervalWorkout(kmPaceParams);
      expect(result.intervals[0]?.targetPace).toContain('per km');
    });
  });

  describe('Input Validation', () => {
    test('should handle malformed marathon time gracefully', () => {
      expect(() => {
        generateIntervalWorkout({ 
          ...baseParams, 
          goalMarathonTime: 'invalid' 
        });
      }).toThrow();
    });

    test('should handle missing marathon time', () => {
      expect(() => {
        generateIntervalWorkout({ 
          ...baseParams, 
          goalMarathonTime: '' 
        });
      }).toThrow();
    });
  });

  describe('Workout Structure', () => {
    test('should include proper warm-up and cool-down', () => {
      const result = generateIntervalWorkout(baseParams);
      
      expect(result.warmUpDistance).toBe(2); // 2 miles warm-up
      expect(result.coolDownDistance).toBe(1); // 1 mile cool-down
    });

    test('should calculate total distance correctly', () => {
      const result = generateIntervalWorkout(baseParams);
      
      // Total = warm-up + (reps * interval distance) + cool-down
      const expectedTotal = 2 + (2 * 0.5) + 1; // 2 + 1 + 1 = 4 miles
      expect(result.totalDistance).toBe(expectedTotal);
    });

    test('should provide detailed instructions', () => {
      const result = generateIntervalWorkout(baseParams);
      
      expect(result.instructions).toBeDefined();
      expect(result.instructions.length).toBeLessThan(15); // Should have reasonable number of instructions
    });
  });

  describe('Performance Tests', () => {
    test('should generate interval workouts quickly', () => {
      const startTime = Date.now();
      
      // Generate 100 interval workouts
      for (let i = 0; i < 100; i++) {
        generateIntervalWorkout({ ...baseParams, week: (i % 14) + 1 });
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
}); 