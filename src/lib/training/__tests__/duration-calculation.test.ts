import { describe, it, expect } from 'vitest';
import { generateTempoRun } from '../tempo-runs';
import { DistanceUnit, PaceFormat } from '@/generated/prisma';
import { TrainingPreferences } from '@/types/training';
import { calculateTrainingPaces } from '../pace-calculator';

describe('Duration Calculation Tests', () => {
  const mockPreferences: TrainingPreferences = {
    distanceUnit: DistanceUnit.MILES,
    paceFormat: PaceFormat.MIN_PER_MILE,
    workoutDays: [1, 2, 3, 4, 5], // Monday through Friday
  };

  describe('Tempo Run Duration Calculation', () => {
    it('should calculate correct duration for 3:30:00 marathon goal - Week 1', () => {
      const goalMarathonTime = '3:30:00';
      const week = 1;
      
      const tempoRun = generateTempoRun({
        goalMarathonTime,
        week,
        preferences: mockPreferences
      });

      // Manual calculation verification:
      // Marathon time: 3:30:00 = 210 minutes for 26.2 miles
      // Marathon pace: 210 / 26.2 = 8.015 minutes/mile = 8:01/mile = 480.57 seconds/mile
      // Training pace: 480.57 - 11 = 469.57 seconds/mile = 7:49.57/mile ≈ 7:50/mile
      // Easy pace: 480.57 + 60 = 540.57 seconds/mile = 9:00.57/mile ≈ 9:01/mile
      
      // Duration calculation:
      // Warm-up: 1 mile @ 9:01 = 9.02 minutes
      // Tempo: 3 miles @ 7:50 = 3 × 7.83 = 23.49 minutes  
      // Cool-down: 1 mile @ 9:01 = 9.02 minutes
      // Total: 9.02 + 23.49 + 9.02 = 41.53 minutes ≈ 42 minutes

      console.log('Generated tempo run:', {
        name: tempoRun.name,
        description: tempoRun.description,
        warmUpDistance: tempoRun.warmUpDistance,
        tempoDistance: tempoRun.tempoDistance,
        coolDownDistance: tempoRun.coolDownDistance,
        totalDistance: tempoRun.totalDistance,
        targetPace: tempoRun.targetPace,
        estimatedDuration: tempoRun.estimatedDuration
      });

      // Verify the basic structure
      expect(tempoRun.warmUpDistance).toBe(1);
      expect(tempoRun.tempoDistance).toBe(3);
      expect(tempoRun.coolDownDistance).toBe(1);
      expect(tempoRun.totalDistance).toBe(5);
      
      // The duration should be around 41-42 minutes based on our calculation
      expect(tempoRun.estimatedDuration).toBeGreaterThanOrEqual(40);
      expect(tempoRun.estimatedDuration).toBeLessThanOrEqual(43);
      
      // Log the actual duration for debugging
      console.log(`Expected duration: ~41-42 minutes, Actual: ${tempoRun.estimatedDuration} minutes`);
    });

    it('should find what marathon time produces 38 minutes duration', () => {
      // Test various marathon times to find which one produces 38 minutes
      const testTimes = [
        '3:00:00', '3:05:00', '3:10:00', '3:15:00', '3:20:00', '3:25:00', '3:30:00', '3:35:00', '3:40:00'
      ];

      console.log('Testing different marathon times to find 38-minute duration:');
      
      testTimes.forEach(time => {
        const tempoRun = generateTempoRun({
          goalMarathonTime: time,
          week: 1,
          preferences: mockPreferences
        });

        console.log(`Marathon time: ${time} → Duration: ${tempoRun.estimatedDuration} minutes, Pace: ${tempoRun.targetPace}`);
        
        // If we find 38 minutes, highlight it
        if (tempoRun.estimatedDuration === 38) {
          console.log(`*** FOUND IT! Marathon time ${time} produces 38 minutes duration ***`);
        }
      });

      // Test some faster times that might produce 38 minutes
      const fasterTimes = ['2:45:00', '2:50:00', '2:55:00'];
      
      console.log('\nTesting faster marathon times:');
      fasterTimes.forEach(time => {
        const tempoRun = generateTempoRun({
          goalMarathonTime: time,
          week: 1,
          preferences: mockPreferences
        });

        console.log(`Marathon time: ${time} → Duration: ${tempoRun.estimatedDuration} minutes, Pace: ${tempoRun.targetPace}`);
        
        if (tempoRun.estimatedDuration === 38) {
          console.log(`*** FOUND IT! Marathon time ${time} produces 38 minutes duration ***`);
        }
      });
    });

    it('should verify specific marathon goal times and their expected durations', () => {
      // Test cases based on common marathon goal times
      const testCases = [
        { 
          time: '3:00:00', 
          expectedDuration: 38, 
          expectedPace: '6:41/mi',
          description: 'Sub-3 hour marathon (competitive runner)'
        },
        { 
          time: '3:30:00', 
          expectedDuration: 42, 
          expectedPace: '7:50/mi',
          description: 'Boston Qualifier for many age groups'
        },
        { 
          time: '4:00:00', 
          expectedDuration: 46, 
          expectedPace: '8:59/mi',
          description: 'Common first marathon goal'
        },
        { 
          time: '4:30:00', 
          expectedDuration: 50, 
          expectedPace: '10:08/mi',
          description: 'Recreational marathon goal'
        },
        { 
          time: '5:00:00', 
          expectedDuration: 54, 
          expectedPace: '11:17/mi',
          description: 'Walk/run marathon goal'
        }
      ];

      console.log('\n=== COMPREHENSIVE DURATION VERIFICATION ===');
      
      testCases.forEach(({ time, expectedDuration, expectedPace, description }) => {
        const tempoRun = generateTempoRun({
          goalMarathonTime: time,
          week: 1,
          preferences: mockPreferences
        });

        console.log(`\n${description}:`);
        console.log(`  Marathon Goal: ${time}`);
        console.log(`  Expected Duration: ${expectedDuration} minutes`);
        console.log(`  Actual Duration: ${tempoRun.estimatedDuration} minutes`);
        console.log(`  Expected Pace: ${expectedPace}`);
        console.log(`  Actual Pace: ${tempoRun.targetPace}`);
        console.log(`  Match: ${tempoRun.estimatedDuration === expectedDuration ? '✅' : '❌'}`);

        // Verify duration is within 1 minute of expected (allowing for rounding)
        expect(Math.abs(tempoRun.estimatedDuration - expectedDuration)).toBeLessThanOrEqual(1);
        
        // Verify pace matches expected
        expect(tempoRun.targetPace).toBe(expectedPace);
      });
    });

    it('should show detailed pace calculations for debugging', () => {
      const goalMarathonTime = '3:30:00';
      
      // Parse marathon time
      const timeParts = goalMarathonTime.split(':').map(Number);
      const marathonTime = { 
        hours: timeParts[0] || 0, 
        minutes: timeParts[1] || 0, 
        seconds: timeParts[2] || 0
      };
      
      // Calculate paces
      const paces = calculateTrainingPaces(marathonTime, mockPreferences);
      
      console.log('Detailed pace calculations:');
      console.log('Marathon time:', marathonTime);
      console.log('Marathon pace:', paces.marathonPace);
      console.log('Easy pace:', paces.easyPace);
      
      // Calculate training pace manually
      const marathonPaceSeconds = paces.marathonPace.minutes * 60 + paces.marathonPace.seconds;
      const trainingPaceSeconds = Math.max(marathonPaceSeconds - 11, 180);
      const trainingPace = {
        minutes: Math.floor(trainingPaceSeconds / 60),
        seconds: trainingPaceSeconds % 60
      };
      
      console.log('Training pace (manual calc):', trainingPace);
      console.log('Marathon pace seconds:', marathonPaceSeconds);
      console.log('Training pace seconds:', trainingPaceSeconds);
      
      // Calculate duration step by step
      const trainingPaceMinutes = trainingPace.minutes + (trainingPace.seconds / 60);
      const easyPaceMinutes = paces.easyPace.minutes + (paces.easyPace.seconds / 60);
      
      console.log('Training pace in decimal minutes:', trainingPaceMinutes);
      console.log('Easy pace in decimal minutes:', easyPaceMinutes);
      
      const warmUpTime = 1 * easyPaceMinutes;
      const tempoTime = 3 * trainingPaceMinutes;
      const coolDownTime = 1 * easyPaceMinutes;
      const totalTime = warmUpTime + tempoTime + coolDownTime;
      
      console.log('Warm-up time:', warmUpTime);
      console.log('Tempo time:', tempoTime);
      console.log('Cool-down time:', coolDownTime);
      console.log('Total time (before rounding):', totalTime);
      console.log('Total time (rounded):', Math.round(totalTime));
      
      // Verify our manual calculation matches the function
      const tempoRun = generateTempoRun({
        goalMarathonTime,
        week: 1,
        preferences: mockPreferences
      });
      
      expect(Math.round(totalTime)).toBe(tempoRun.estimatedDuration);
    });

    it('should test different marathon times for duration accuracy', () => {
      const testCases = [
        { time: '3:00:00', expectedRange: [35, 38] },
        { time: '3:30:00', expectedRange: [40, 43] },
        { time: '4:00:00', expectedRange: [45, 48] },
        { time: '4:30:00', expectedRange: [50, 53] },
      ];

      testCases.forEach(({ time, expectedRange }) => {
        const tempoRun = generateTempoRun({
          goalMarathonTime: time,
          week: 1,
          preferences: mockPreferences
        });

        console.log(`Marathon time: ${time}, Duration: ${tempoRun.estimatedDuration} minutes`);
        
        expect(tempoRun.estimatedDuration).toBeGreaterThanOrEqual(expectedRange[0] || 0);
        expect(tempoRun.estimatedDuration).toBeLessThanOrEqual(expectedRange[1] || 100);
      });
    });

    it('should verify duration scales correctly across weeks', () => {
      const goalMarathonTime = '3:30:00';
      
      // Test weeks 1, 5, 10 (peak), and 14 (taper)
      const testWeeks = [1, 5, 10, 14];
      const expectedTempoDistances = [3, 7, 12, 4];
      
      testWeeks.forEach((week, index) => {
        const tempoRun = generateTempoRun({
          goalMarathonTime,
          week,
          preferences: mockPreferences
        });

        console.log(`Week ${week}: ${tempoRun.tempoDistance} miles, ${tempoRun.estimatedDuration} minutes`);
        
        expect(tempoRun.tempoDistance).toBe(expectedTempoDistances[index] || 0);
        
        // Duration should increase with distance
        if (index > 0) {
          const prevWeek = testWeeks[index - 1];
          if (prevWeek) {
            const prevTempoRun = generateTempoRun({
              goalMarathonTime,
              week: prevWeek,
              preferences: mockPreferences
            });
            
            if (tempoRun.tempoDistance > prevTempoRun.tempoDistance) {
              expect(tempoRun.estimatedDuration).toBeGreaterThan(prevTempoRun.estimatedDuration);
            }
          }
        }
      });
    });

    it('should handle kilometers correctly', () => {
      const kmPreferences: TrainingPreferences = {
        ...mockPreferences,
        distanceUnit: DistanceUnit.KILOMETERS
      };

      const tempoRun = generateTempoRun({
        goalMarathonTime: '3:30:00',
        week: 1,
        preferences: kmPreferences
      });

      console.log('Kilometers test:', {
        warmUpDistance: tempoRun.warmUpDistance,
        tempoDistance: tempoRun.tempoDistance,
        coolDownDistance: tempoRun.coolDownDistance,
        totalDistance: tempoRun.totalDistance,
        estimatedDuration: tempoRun.estimatedDuration
      });

      // 3 miles = ~4.83 km
      expect(tempoRun.tempoDistance).toBeCloseTo(4.83, 1);
      // 1 mile warm-up/cool-down = ~1.6 km each
      expect(tempoRun.warmUpDistance).toBeCloseTo(1.6, 1);
      expect(tempoRun.coolDownDistance).toBeCloseTo(1.6, 1);
      
      // Duration should be similar regardless of units (same actual distance)
      const milesTempoRun = generateTempoRun({
        goalMarathonTime: '3:30:00',
        week: 1,
        preferences: mockPreferences
      });
      
      expect(Math.abs(tempoRun.estimatedDuration - milesTempoRun.estimatedDuration)).toBeLessThanOrEqual(1);
    });
  });
}); 