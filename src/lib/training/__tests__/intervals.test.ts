import { describe, it, expect } from 'vitest';
import { generateIntervalWorkout } from '../intervals';
import type { IntervalParams, TrainingPreferences } from '@/types/training';
import { DistanceUnit, PaceFormat, ExperienceLevel } from '@/generated/prisma';

describe('Intervals Algorithm', () => {
  const defaultPreferences: TrainingPreferences = {
    distanceUnit: DistanceUnit.KILOMETERS,
    paceFormat: PaceFormat.MIN_PER_KM,
    workoutDays: [1, 3, 5] // Monday, Wednesday, Friday
  };

  describe('generateIntervalWorkout', () => {
    it('should generate valid interval workout for early weeks', () => {
      const params: IntervalParams = {
        goalMarathonTime: '4:00:00',
        week: 2,
        preferences: defaultPreferences
      };

      const workout = generateIntervalWorkout(params);

      // Basic structure validation
      expect(workout.name).toBeDefined();
      expect(workout.description).toBeDefined();
      expect(workout.week).toBe(2);
      expect(workout.intervals).toBeDefined();
      expect(workout.intervals.length).toBeGreaterThan(0);

      // Distance validation
      expect(workout.warmUpDistance).toBeGreaterThan(0);
      expect(workout.coolDownDistance).toBeGreaterThan(0);
      expect(workout.totalDistance).toBeGreaterThan(0);

      // Total distance should equal warm-up + intervals + cool-down
      const intervalDistance = workout.intervals.reduce((total, interval) => 
        total + (interval.distance * interval.repetitions), 0);
      const expectedTotal = workout.warmUpDistance + intervalDistance + workout.coolDownDistance;
      expect(workout.totalDistance).toBeCloseTo(expectedTotal, 1);

      // Duration should be reasonable (30-120 minutes)
      expect(workout.estimatedDuration).toBeGreaterThan(30);
      expect(workout.estimatedDuration).toBeLessThan(120);

      // Instructions should be provided
      expect(workout.instructions).toBeDefined();
      expect(workout.instructions.length).toBeGreaterThan(0);
    });

    it('should generate progressively harder workouts as weeks advance', () => {
      const baseParams: IntervalParams = {
        goalMarathonTime: '4:00:00',
        preferences: defaultPreferences
      };

      const earlyWeek = generateIntervalWorkout({ ...baseParams, week: 2 });
      const midWeek = generateIntervalWorkout({ ...baseParams, week: 6 });
      const lateWeek = generateIntervalWorkout({ ...baseParams, week: 10 });

      // Later weeks should generally have more total distance or more repetitions
      const earlyTotalReps = earlyWeek.intervals.reduce((total, interval) => total + interval.repetitions, 0);
      const midTotalReps = midWeek.intervals.reduce((total, interval) => total + interval.repetitions, 0);
      const lateTotalReps = lateWeek.intervals.reduce((total, interval) => total + interval.repetitions, 0);

      // Should show progression (though not necessarily strictly increasing every week)
      expect(lateTotalReps).toBeGreaterThanOrEqual(earlyTotalReps);
      expect(lateWeek.totalDistance).toBeGreaterThanOrEqual(earlyWeek.totalDistance);
    });

    it('should handle different marathon goal times appropriately', () => {
      const fastGoal = generateIntervalWorkout({
        goalMarathonTime: '3:00:00',
        week: 5,
        preferences: defaultPreferences
      });

      const slowGoal = generateIntervalWorkout({
        goalMarathonTime: '5:00:00',
        week: 5,
        preferences: defaultPreferences
      });

      // Both should have valid structure
      expect(fastGoal.intervals.length).toBeGreaterThan(0);
      expect(slowGoal.intervals.length).toBeGreaterThan(0);

      // Target paces should be different (faster goal = faster interval pace)
      const fastPace = fastGoal.intervals[0].targetPace;
      const slowPace = slowGoal.intervals[0].targetPace;
      expect(fastPace).not.toBe(slowPace);

      // Parse paces to compare (format: "MM:SS")
      const [fastMin, fastSec] = fastPace.split(':').map(Number);
      const [slowMin, slowSec] = slowPace.split(':').map(Number);
      const fastTotalSeconds = fastMin * 60 + fastSec;
      const slowTotalSeconds = slowMin * 60 + slowSec;
      
      expect(fastTotalSeconds).toBeLessThan(slowTotalSeconds);
    });

    it('should handle missing marathon goal time gracefully', () => {
      const params: IntervalParams = {
        week: 5,
        preferences: defaultPreferences
        // No goalMarathonTime provided
      };

      const workout = generateIntervalWorkout(params);

      // Should still generate a valid workout
      expect(workout.name).toBeDefined();
      expect(workout.intervals.length).toBeGreaterThan(0);
      expect(workout.totalDistance).toBeGreaterThan(0);
      expect(workout.estimatedDuration).toBeGreaterThan(0);
    });

    it('should respect distance unit preferences', () => {
      const kmParams: IntervalParams = {
        goalMarathonTime: '4:00:00',
        week: 5,
        preferences: { ...defaultPreferences, distanceUnit: DistanceUnit.KILOMETERS }
      };

      const mileParams: IntervalParams = {
        goalMarathonTime: '4:00:00',
        week: 5,
        preferences: { ...defaultPreferences, distanceUnit: DistanceUnit.MILES }
      };

      const kmWorkout = generateIntervalWorkout(kmParams);
      const mileWorkout = generateIntervalWorkout(mileParams);

      // Both should be valid
      expect(kmWorkout.totalDistance).toBeGreaterThan(0);
      expect(mileWorkout.totalDistance).toBeGreaterThan(0);

      // Mile distances should generally be smaller numbers than km
      // (since 1 mile = 1.6 km, same workout in miles should have smaller distance values)
      expect(mileWorkout.totalDistance).toBeLessThan(kmWorkout.totalDistance);
    });

    it('should generate appropriate interval types for different weeks', () => {
      const weeks = [2, 4, 6, 8, 10, 12];
      
      weeks.forEach(week => {
        const workout = generateIntervalWorkout({
          goalMarathonTime: '4:00:00',
          week,
          preferences: defaultPreferences
        });

        // Each week should have valid intervals
        expect(workout.intervals.length).toBeGreaterThan(0);
        
        // All intervals should have reasonable properties
        workout.intervals.forEach(interval => {
          expect(interval.distance).toBeGreaterThan(0);
          expect(interval.repetitions).toBeGreaterThan(0);
          expect(interval.targetPace).toMatch(/^\d+:\d{2}$/); // MM:SS format
          expect(interval.recoveryTime).toBeGreaterThan(0);
        });
      });
    });

    it('should have consistent interval structure', () => {
      const workout = generateIntervalWorkout({
        goalMarathonTime: '4:00:00',
        week: 6,
        preferences: defaultPreferences
      });

      // Validate interval set structure
      workout.intervals.forEach(interval => {
        // Distance should be reasonable (200m to 2000m converted to km)
        expect(interval.distance).toBeGreaterThan(0.1); // 100m minimum
        expect(interval.distance).toBeLessThan(3.0); // 3km maximum per interval

        // Repetitions should be reasonable
        expect(interval.repetitions).toBeGreaterThan(0);
        expect(interval.repetitions).toBeLessThan(20); // Max 20 reps

        // Recovery time should be reasonable (30 seconds to 5 minutes)
        expect(interval.recoveryTime).toBeGreaterThan(30);
        expect(interval.recoveryTime).toBeLessThan(300);

        // Target pace should be in correct format
        expect(interval.targetPace).toMatch(/^\d+:\d{2}$/);
      });
    });

    it('should provide meaningful workout instructions', () => {
      const workout = generateIntervalWorkout({
        goalMarathonTime: '4:00:00',
        week: 8,
        preferences: defaultPreferences
      });

      expect(workout.instructions).toBeDefined();
      expect(workout.instructions.length).toBeGreaterThan(0);

      // Instructions should contain useful information
      const instructionText = workout.instructions.join(' ').toLowerCase();
      
      // Should mention key workout components
      expect(
        instructionText.includes('warm') ||
        instructionText.includes('pace') ||
        instructionText.includes('recovery') ||
        instructionText.includes('cool')
      ).toBe(true);
    });

    it('should handle edge cases gracefully', () => {
      // Test very early week
      const veryEarly = generateIntervalWorkout({
        goalMarathonTime: '4:00:00',
        week: 1,
        preferences: defaultPreferences
      });
      expect(veryEarly.intervals.length).toBeGreaterThan(0);

      // Test very late week (close to taper)
      const veryLate = generateIntervalWorkout({
        goalMarathonTime: '4:00:00',
        week: 13,
        preferences: defaultPreferences
      });
      expect(veryLate.intervals.length).toBeGreaterThan(0);

      // Test extreme marathon times
      const veryFast = generateIntervalWorkout({
        goalMarathonTime: '2:30:00',
        week: 6,
        preferences: defaultPreferences
      });
      expect(veryFast.intervals.length).toBeGreaterThan(0);

      const verySlow = generateIntervalWorkout({
        goalMarathonTime: '6:00:00',
        week: 6,
        preferences: defaultPreferences
      });
      expect(verySlow.intervals.length).toBeGreaterThan(0);
    });
  });
}); 