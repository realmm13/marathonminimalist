import { describe, test, expect } from 'vitest';
import { generateLongRun } from '../long-runs';
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

describe('Long Run Algorithm', () => {
  describe('Basic Functionality', () => {
    test('should generate long run for week 1', () => {
      const result = generateLongRun(baseParams);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('LONG_RUN');
      expect(result.week).toBe(1);
      expect(result.description).toContain('easy');
    });

    test('should generate long run for peak week (week 8)', () => {
      const result = generateLongRun({ ...baseParams, week: 8 });
      
      expect(result.week).toBe(8);
      // Week 8 should be peak long run (120 minutes)
      expect(result.estimatedDuration).toBeGreaterThan(100); // Should be around 120-150 minutes
      expect(result.estimatedDuration).toBeLessThan(200);
    });

    test('should generate long run for taper week (week 13)', () => {
      const result = generateLongRun({ ...baseParams, week: 13 });
      
      expect(result.week).toBe(13);
      // Should be tapered duration (60 minutes slow + ~8 minutes marathon pace = ~108 minutes)
      expect(result.estimatedDuration).toBeLessThan(120);
    });
  });

  describe('Distance Progression', () => {
    test('should follow correct 14-week progression', () => {
      // Test that progression makes sense (increasing then tapering)
      const results = [];
      for (let week = 1; week <= 14; week++) {
        const result = generateLongRun({ ...baseParams, week });
        results.push({ week, duration: result.estimatedDuration });
      }
      
      // Should generally increase until peak, then taper
      expect(results[7]?.duration).toBeLessThanOrEqual(results[8]?.duration || 0); // Week 8 >= Week 7 (both are peak weeks)
      expect(results[12]?.duration).toBeLessThan(results[7]?.duration || 0); // Week 13 < Week 8
    });

    test('should handle invalid week numbers', () => {
      expect(() => {
        generateLongRun({ ...baseParams, week: 15 });
      }).toThrow();

      expect(() => {
        generateLongRun({ ...baseParams, week: 0 });
      }).toThrow();
    });
  });

  describe('Marathon Pace Miles', () => {
    test('should include marathon pace miles in all weeks', () => {
      // Check all weeks have marathon pace miles
      for (let week = 1; week <= 14; week++) {
        const result = generateLongRun({ ...baseParams, week });
        expect(result.marathonPaceDistance).toBeGreaterThan(0); // Should be positive
        expect(result.marathonPaceDistance).toBeLessThan(10); // Should be reasonable
      }
    });

    test('should have progression in marathon pace miles', () => {
      const week1 = generateLongRun({ ...baseParams, week: 1 });
      const week5 = generateLongRun({ ...baseParams, week: 5 });
      
      expect(week5.marathonPaceDistance).toBeGreaterThan(week1.marathonPaceDistance); // Week 5 > Week 1
    });
  });

  describe('Pace Calculations', () => {
    test('should calculate correct marathon pace for different times', () => {
      const testCases = [
        { marathonTime: '3:00:00', expectedPace: '6:52/mi' },
        { marathonTime: '3:30:00', expectedPace: '8:01/mi' },
        { marathonTime: '4:00:00', expectedPace: '9:09/mi' },
        { marathonTime: '4:30:00', expectedPace: '10:18/mi' },
        { marathonTime: '5:00:00', expectedPace: '11:27/mi' }
      ];

      testCases.forEach(({ marathonTime, expectedPace }) => {
        const result = generateLongRun({ 
          ...baseParams, 
          goalMarathonTime: marathonTime,
          week: 8 // Week with marathon pace miles
        });
        expect(result.targetMarathonPace).toBe(expectedPace);
      });
    });
  });

  describe('Unit Conversions', () => {
    test('should convert to kilometers when requested', () => {
      const kmParams = {
        ...baseParams,
        preferences: {
          ...baseParams.preferences,
          distanceUnit: DistanceUnit.KILOMETERS
        }
      };

      const result = generateLongRun(kmParams);
      // Should use kilometers in descriptions and calculations
      expect(result.description).toContain('kilometers');
    });

    test('should convert pace to min/km when requested', () => {
      const kmPaceParams = {
        ...baseParams,
        preferences: {
          ...baseParams.preferences,
          paceFormat: PaceFormat.MIN_PER_KM
        }
      };

      const result = generateLongRun(kmPaceParams);
      expect(result.targetMarathonPace).toContain(':'); // Should still be in pace format
    });
  });

  describe('Input Validation', () => {
    test('should handle malformed marathon time gracefully', () => {
      expect(() => {
        generateLongRun({ 
          ...baseParams, 
          goalMarathonTime: 'invalid' 
        });
      }).toThrow();
    });

    test('should handle missing marathon time', () => {
      expect(() => {
        generateLongRun({ 
          ...baseParams, 
          goalMarathonTime: '' 
        });
      }).toThrow();
    });
  });

  describe('Workout Structure', () => {
    test('should have reasonable estimated duration', () => {
      const result = generateLongRun(baseParams);
      
      expect(result.estimatedDuration).toBeLessThan(300); // Less than 5 hours
      expect(result.estimatedDuration).toBeGreaterThan(0); // Should be positive
    });

    test('should provide detailed instructions', () => {
      const result = generateLongRun(baseParams);
      
      expect(result.instructions).toBeDefined();
      expect(result.instructions.length).toBeGreaterThan(0); // Should have instructions
      expect(result.instructions.length).toBeLessThan(15); // Should have reasonable number of instructions
    });

    test('should include proper pacing guidance', () => {
      const result = generateLongRun({ ...baseParams, week: 8 });
      
      expect(result.instructions.some(instruction => 
        instruction.toLowerCase().includes('marathon pace')
      )).toBe(true);
    });
  });

  describe('Time-Based Structure', () => {
    test('should use time-based approach for easy portion', () => {
      const result = generateLongRun(baseParams);
      
      // Should have estimatedDuration defined
      expect(result.estimatedDuration).toBeDefined();
      expect(result.estimatedDuration).toBeGreaterThan(0); // Should be positive
    });

    test('should balance easy running with marathon pace', () => {
      const result = generateLongRun({ ...baseParams, week: 8 });
      
      // Should have both easy and marathon pace portions
      expect(result.easyRunDistance).toBeGreaterThan(0); // Should be positive
      expect(result.marathonPaceDistance).toBeGreaterThan(0); // Should be positive
      expect(result.easyRunDistance).toBeGreaterThan(result.marathonPaceDistance); // Easy should be longer
    });
  });
}); 