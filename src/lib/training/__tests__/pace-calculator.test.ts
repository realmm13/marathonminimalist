import { describe, it, expect } from 'vitest';
import { 
  calculateTrainingPaces, 
  formatPaceTime, 
  parseTimeString, 
  paceTimeToSeconds,
  secondsToPaceTime,
  convertPace,
  formatPaceForUser,
  estimate5KToMarathonTime
} from '../pace-calculator';
import type { PaceTime, MarathonTime, TrainingPreferences } from '@/types/training';
import { DistanceUnit, PaceFormat } from '@/generated/prisma';

describe('Pace Calculator', () => {
  const defaultPreferences: TrainingPreferences = {
    distanceUnit: DistanceUnit.KILOMETERS,
    paceFormat: PaceFormat.MIN_PER_KM,
    workoutDays: [1, 3, 5] // Monday, Wednesday, Friday
  };

  describe('calculateTrainingPaces', () => {
    it('should calculate correct paces for a 4:00:00 marathon goal', () => {
      const marathonTime: MarathonTime = { hours: 4, minutes: 0, seconds: 0 };
      const paces = calculateTrainingPaces(marathonTime, defaultPreferences);

      // Verify all pace types are present
      expect(paces.marathonPace).toBeDefined();
      expect(paces.tempoPace).toBeDefined();
      expect(paces.intervalPace).toBeDefined();
      expect(paces.easyPace).toBeDefined();
      expect(paces.longRunPace).toBeDefined();

      // Easy pace should be slower than marathon pace
      const easySeconds = paceTimeToSeconds(paces.easyPace);
      const marathonSeconds = paceTimeToSeconds(paces.marathonPace);
      expect(easySeconds).toBeGreaterThan(marathonSeconds);

      // Tempo pace should be faster than marathon pace
      const tempoSeconds = paceTimeToSeconds(paces.tempoPace);
      expect(tempoSeconds).toBeLessThan(marathonSeconds);

      // Interval pace should be fastest
      const intervalSeconds = paceTimeToSeconds(paces.intervalPace);
      expect(intervalSeconds).toBeLessThan(tempoSeconds);
    });

    it('should calculate correct paces for a 3:30:00 marathon goal', () => {
      const marathonTime: MarathonTime = { hours: 3, minutes: 30, seconds: 0 };
      const paces = calculateTrainingPaces(marathonTime, defaultPreferences);

      // Verify pace hierarchy
      const easySeconds = paceTimeToSeconds(paces.easyPace);
      const marathonSeconds = paceTimeToSeconds(paces.marathonPace);
      const tempoSeconds = paceTimeToSeconds(paces.tempoPace);
      const intervalSeconds = paceTimeToSeconds(paces.intervalPace);

      expect(easySeconds).toBeGreaterThan(marathonSeconds);
      expect(tempoSeconds).toBeLessThan(marathonSeconds);
      expect(intervalSeconds).toBeLessThan(tempoSeconds);
    });

    it('should handle edge case of very fast marathon time', () => {
      const marathonTime: MarathonTime = { hours: 2, minutes: 30, seconds: 0 };
      const paces = calculateTrainingPaces(marathonTime, defaultPreferences);

      // Should still maintain pace hierarchy
      const easySeconds = paceTimeToSeconds(paces.easyPace);
      const marathonSeconds = paceTimeToSeconds(paces.marathonPace);
      const tempoSeconds = paceTimeToSeconds(paces.tempoPace);
      const intervalSeconds = paceTimeToSeconds(paces.intervalPace);

      expect(easySeconds).toBeGreaterThan(marathonSeconds);
      expect(tempoSeconds).toBeLessThan(marathonSeconds);
      expect(intervalSeconds).toBeLessThan(tempoSeconds);
    });

    it('should handle edge case of slower marathon time', () => {
      const marathonTime: MarathonTime = { hours: 5, minutes: 0, seconds: 0 };
      const paces = calculateTrainingPaces(marathonTime, defaultPreferences);

      // Should still maintain pace hierarchy
      const easySeconds = paceTimeToSeconds(paces.easyPace);
      const marathonSeconds = paceTimeToSeconds(paces.marathonPace);
      const tempoSeconds = paceTimeToSeconds(paces.tempoPace);
      const intervalSeconds = paceTimeToSeconds(paces.intervalPace);

      expect(easySeconds).toBeGreaterThan(marathonSeconds);
      expect(tempoSeconds).toBeLessThan(marathonSeconds);
      expect(intervalSeconds).toBeLessThan(tempoSeconds);
    });
  });

  describe('formatPaceTime', () => {
    it('should format pace correctly', () => {
      const pace: PaceTime = { minutes: 5, seconds: 30 };
      expect(formatPaceTime(pace)).toBe('5:30');
    });

    it('should pad single digit seconds', () => {
      const pace: PaceTime = { minutes: 4, seconds: 5 };
      expect(formatPaceTime(pace)).toBe('4:05');
    });

    it('should handle zero seconds', () => {
      const pace: PaceTime = { minutes: 6, seconds: 0 };
      expect(formatPaceTime(pace)).toBe('6:00');
    });
  });

  describe('parseTimeString', () => {
    it('should parse valid pace string (MM:SS)', () => {
      const result = parseTimeString('5:30');
      expect(result).toEqual({ minutes: 5, seconds: 30 });
    });

    it('should parse pace with single digit seconds', () => {
      const result = parseTimeString('4:05');
      expect(result).toEqual({ minutes: 4, seconds: 5 });
    });

    it('should parse marathon time string (HH:MM:SS)', () => {
      const result = parseTimeString('4:30:15');
      expect(result).toEqual({ minutes: 270, seconds: 15 }); // 4*60 + 30 = 270 minutes
    });

    it('should throw error for invalid format', () => {
      expect(() => parseTimeString('invalid')).toThrow('Invalid time format');
      expect(() => parseTimeString('5')).toThrow('Invalid time format');
    });
  });

  describe('paceTimeToSeconds', () => {
    it('should convert pace to seconds correctly', () => {
      const pace: PaceTime = { minutes: 5, seconds: 30 };
      const result = paceTimeToSeconds(pace);
      expect(result).toBe(330); // 5*60 + 30 = 330 seconds
    });

    it('should handle zero seconds', () => {
      const pace: PaceTime = { minutes: 4, seconds: 0 };
      const result = paceTimeToSeconds(pace);
      expect(result).toBe(240); // 4*60 = 240 seconds
    });
  });

  describe('secondsToPaceTime', () => {
    it('should convert seconds to pace correctly', () => {
      const result = secondsToPaceTime(330);
      expect(result).toEqual({ minutes: 5, seconds: 30 });
    });

    it('should handle exact minutes', () => {
      const result = secondsToPaceTime(240);
      expect(result).toEqual({ minutes: 4, seconds: 0 });
    });

    it('should round seconds correctly', () => {
      const result = secondsToPaceTime(330.7);
      expect(result).toEqual({ minutes: 5, seconds: 31 });
    });
  });

  describe('convertPace', () => {
    it('should convert from km to miles', () => {
      const kmPace: PaceTime = { minutes: 5, seconds: 0 }; // 5:00/km
      const result = convertPace(kmPace, DistanceUnit.KILOMETERS, DistanceUnit.MILES);
      
      // 5:00/km should be approximately 8:03/mile
      expect(result.minutes).toBe(8);
      expect(result.seconds).toBeCloseTo(3, 0);
    });

    it('should convert from miles to km', () => {
      const milePace: PaceTime = { minutes: 8, seconds: 0 }; // 8:00/mile
      const result = convertPace(milePace, DistanceUnit.MILES, DistanceUnit.KILOMETERS);
      
      // 8:00/mile should be approximately 4:58/km
      expect(result.minutes).toBe(4);
      expect(result.seconds).toBeCloseTo(58, 0);
    });

    it('should return same pace when units are identical', () => {
      const pace: PaceTime = { minutes: 5, seconds: 30 };
      const result = convertPace(pace, DistanceUnit.KILOMETERS, DistanceUnit.KILOMETERS);
      expect(result).toEqual(pace);
    });
  });

  describe('formatPaceForUser', () => {
    it('should format pace with km unit', () => {
      const pace: PaceTime = { minutes: 5, seconds: 30 };
      const kmPreferences = { ...defaultPreferences, distanceUnit: DistanceUnit.KILOMETERS };
      const result = formatPaceForUser(pace, kmPreferences);
      
      // Should convert from internal miles format to km and add unit
      expect(result).toMatch(/\d+:\d+\/km/);
    });

    it('should format pace with mile unit', () => {
      const pace: PaceTime = { minutes: 8, seconds: 0 };
      const milePreferences = { ...defaultPreferences, distanceUnit: DistanceUnit.MILES };
      const result = formatPaceForUser(pace, milePreferences);
      
      expect(result).toBe('8:00/mi');
    });
  });

  describe('estimate5KToMarathonTime', () => {
    it('should estimate marathon time from 5K time', () => {
      // 25:00 5K time (5:00/mile pace) should estimate around 3:30-4:00 marathon
      const result = estimate5KToMarathonTime('25:00');
      expect(result).toMatch(/^\d{1}:\d{2}:\d{2}$/); // Format: H:MM:SS
      
      const [hours, minutes, seconds] = result.split(':').map(Number);
      expect(hours).toBeGreaterThan(2); // Should be slower than 2 hours
      expect(hours).toBeLessThan(5); // Should be faster than 5 hours
    });

    it('should handle faster 5K times', () => {
      // 20:00 5K time (4:00/mile pace) should estimate around 2:45-3:15 marathon
      const result = estimate5KToMarathonTime('20:00');
      expect(result).toMatch(/^\d{1}:\d{2}:\d{2}$/);
      
      const [hours] = result.split(':').map(Number);
      expect(hours).toBeGreaterThan(1); // Should be reasonable
      expect(hours).toBeLessThan(4); // Should be fast
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency between conversion functions', () => {
      const originalPace: PaceTime = { minutes: 5, seconds: 45 };
      const seconds = paceTimeToSeconds(originalPace);
      const convertedBack = secondsToPaceTime(seconds);
      
      expect(convertedBack).toEqual(originalPace);
    });

    it('should produce realistic training paces for common marathon times', () => {
      // Test common marathon goal times
      const commonGoals = [
        { hours: 3, minutes: 0, seconds: 0 },
        { hours: 3, minutes: 30, seconds: 0 },
        { hours: 4, minutes: 0, seconds: 0 },
        { hours: 4, minutes: 30, seconds: 0 },
      ];

      commonGoals.forEach((time) => {
        const paces = calculateTrainingPaces(time, defaultPreferences);
        
        // All paces should be reasonable (between 3:00 and 12:00 per mile/km)
        [paces.marathonPace, paces.tempoPace, paces.intervalPace, paces.easyPace, paces.longRunPace].forEach(pace => {
          expect(pace.minutes).toBeGreaterThan(2);
          expect(pace.minutes).toBeLessThan(13);
          expect(pace.seconds).toBeGreaterThanOrEqual(0);
          expect(pace.seconds).toBeLessThan(60);
        });
      });
    });
  });
}); 