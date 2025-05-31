import { describe, test, expect } from 'vitest';
import { generateTempoRun } from '../tempo-runs';
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

describe('Tempo Run Algorithm', () => {
  describe('Basic Functionality', () => {
    test('should generate tempo run for week 1', () => {
      const result = generateTempoRun({ ...baseParams, week: 1 });
      
      expect(result).toBeDefined();
      expect(result.type).toBe('TEMPO_RUN');
      expect(result.week).toBe(1);
      expect(result.tempoDistance).toBe(3); // Week 1 should be 3 miles
      expect(result.targetPace).toBe('7:50/mi'); // Training pace (11 seconds faster than 8:01/mi marathon pace)
      expect(result.description).toContain('training pace');
    });

    test('should generate tempo run for peak week (week 10)', () => {
      const result = generateTempoRun({ ...baseParams, week: 10 });
      
      expect(result.week).toBe(10);
      expect(result.tempoDistance).toBe(12); // Peak distance
      expect(result.targetPace).toBe('7:50/mi'); // Training pace (11 seconds faster than marathon pace)
    });

    test('should generate tempo run for taper week (week 13)', () => {
      const result = generateTempoRun({ ...baseParams, week: 13 });
      
      expect(result.week).toBe(13);
      expect(result.tempoDistance).toBe(6); // Tapered distance
      expect(result.targetPace).toBe('7:50/mi'); // Training pace (11 seconds faster than marathon pace)
    });
  });

  describe('Distance Progression', () => {
    test('should follow correct 14-week progression', () => {
      const expectedDistances = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 10, 8, 6, 4];
      
      for (let week = 1; week <= 14; week++) {
        const result = generateTempoRun({ ...baseParams, week });
        expect(result.tempoDistance).toBe(expectedDistances[week - 1]);
      }
    });

    test('should handle invalid week numbers', () => {
      expect(() => {
        generateTempoRun({ ...baseParams, week: 15 });
      }).toThrow();

      expect(() => {
        generateTempoRun({ ...baseParams, week: 0 });
      }).toThrow();
    });
  });

  describe('Pace Calculations', () => {
    test('should calculate correct pace for different marathon times', () => {
      const testCases = [
        { marathonTime: '3:30:00', expectedPace: '7:50/mi' }, // Training pace (11 seconds faster than 8:01/mi)
        { marathonTime: '4:00:00', expectedPace: '8:58/mi' }, // Training pace (11 seconds faster than 9:09/mi)
        { marathonTime: '3:00:00', expectedPace: '6:41/mi' }  // Training pace (11 seconds faster than 6:52/mi)
      ];

      testCases.forEach(({ marathonTime, expectedPace }) => {
        const result = generateTempoRun({
          ...baseParams,
          goalMarathonTime: marathonTime
        });
        expect(result.targetPace).toBe(expectedPace);
      });
    });

    test('should handle edge case marathon times', () => {
      // Very fast marathon time
      const fastResult = generateTempoRun({
        ...baseParams,
        goalMarathonTime: '2:30:00'
      });
      expect(fastResult.targetPace).toBe('5:32/mi'); // Training pace (11 seconds faster than 5:43/mi)

      // Slower marathon time
      const slowResult = generateTempoRun({
        ...baseParams,
        goalMarathonTime: '5:00:00'
      });
      expect(slowResult.targetPace).toBe('11:16/mi'); // Training pace (11 seconds faster than 11:27/mi)
    });
  });

  describe('Unit Conversions', () => {
    test('should convert distances to kilometers when requested', () => {
      const kmParams = {
        ...baseParams,
        preferences: {
          ...baseParams.preferences,
          distanceUnit: DistanceUnit.KILOMETERS
        }
      };

      const result = generateTempoRun(kmParams);
      
      // 3 miles = ~4.83 km, should be rounded appropriately
      expect(result.tempoDistance).toBeCloseTo(4.8, 1);
    });

    test('should convert pace to min/km when requested', () => {
      const kmPaceParams = {
        ...baseParams,
        preferences: {
          ...baseParams.preferences,
          distanceUnit: DistanceUnit.KILOMETERS
        }
      };

      const result = generateTempoRun(kmPaceParams);
      
      // 7:50/mile = ~4:52/km (training pace, 11 seconds faster than marathon pace)
      expect(result.targetPace).toBe('4:52/km');
    });
  });

  describe('Training Pace Calculation', () => {
    test('should apply 10-12 second cushion to marathon pace', () => {
      const result = generateTempoRun(baseParams);
      
      // For 3:30:00 marathon time:
      // Marathon pace = 8:01/mi
      // Training pace = 7:50/mi (11 seconds faster)
      expect(result.targetPace).toBe('7:50/mi');
      
      // Instructions should mention both paces
      expect(result.instructions.some(instruction => 
        instruction.includes('7:50/mi')
      )).toBe(true);
      expect(result.instructions.some(instruction => 
        instruction.includes('8:01/mi')
      )).toBe(true);
    });

    test('should respect minimum pace of 3:00/mile', () => {
      const fastParams = {
        ...baseParams,
        goalMarathonTime: '2:30:00' // Very fast marathon time
      };

      const result = generateTempoRun(fastParams);
      
      // Should not go faster than 3:00/mile even with cushion
      const paceSeconds = parseInt(result.targetPace.split(':')[0]!) * 60 + 
                         parseInt(result.targetPace.split(':')[1]!.split('/')[0]!);
      expect(paceSeconds).toBeGreaterThanOrEqual(180); // 3:00 = 180 seconds
    });
  });

  describe('Workout Description', () => {
    test('should include appropriate warmup and cooldown', () => {
      const result = generateTempoRun(baseParams);
      
      expect(result.description).toContain('training pace');
      expect(result.instructions.some(instruction => 
        instruction.includes('Warm up with 1 mile easy jog at')
      )).toBe(true);
      expect(result.instructions.some(instruction => 
        instruction.includes('Cool down with 1 mile easy jog at')
      )).toBe(true);
      // Should include specific easy pace information
      expect(result.instructions.some(instruction => 
        instruction.includes('9:01/mi')
      )).toBe(true);
    });

    test('should mention target pace in description', () => {
      const result = generateTempoRun(baseParams);

      expect(result.targetPace).toBe('7:50/mi');
      expect(result.instructions.some(instruction => 
        instruction.includes('7:50/mi')
      )).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid marathon time format', () => {
      expect(() => {
        generateTempoRun({ 
          ...baseParams, 
          goalMarathonTime: 'invalid' 
        });
      }).toThrow();
    });

    test('should throw error for negative week', () => {
      expect(() => {
        generateTempoRun({ ...baseParams, week: -1 });
      }).toThrow();
    });

    test('should throw error for week beyond 14', () => {
      expect(() => {
        generateTempoRun({ ...baseParams, week: 15 });
      }).toThrow();
    });
  });

  describe('Consistency Checks', () => {
    test('should maintain consistent pace across all weeks', () => {
      const paces: string[] = [];
      
      for (let week = 1; week <= 14; week++) {
        const result = generateTempoRun({ ...baseParams, week });
        paces.push(result.targetPace);
      }

      // All paces should be the same (training pace)
      const uniquePaces = [...new Set(paces)];
      expect(uniquePaces).toHaveLength(1);
      expect(uniquePaces[0]).toBe('7:50/mi');
    });

    test('should have progressive distance increase until peak', () => {
      const distances = [];
      for (let week = 1; week <= 10; week++) { // Up to peak week
        const result = generateTempoRun({ ...baseParams, week });
        distances.push(result.tempoDistance);
      }
      
      // Check that distances generally increase (allowing for some variation)
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1] || 0);
      }
    });
  });
}); 