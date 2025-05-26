import { TrainingScheduler, TrainingSchedulerParams, ScheduledTrainingPlan } from '../training-scheduler';
import { DistanceUnit, PaceFormat } from '../../../generated/prisma';
import { TrainingPreferences } from '@/types/training';
import { describe, test, expect } from 'vitest';

const mockPreferences: TrainingPreferences = {
  distanceUnit: DistanceUnit.KILOMETERS,
  paceFormat: PaceFormat.MIN_PER_KM,
  workoutDays: [2, 4, 6, 7] // Tuesday, Thursday, Saturday, Sunday
};

const baseParams: TrainingSchedulerParams = {
  startDate: new Date('2024-01-01'),
  goalMarathonTime: '04:00:00',
  workoutDays: [2, 4, 6, 7], // Tuesday, Thursday, Saturday, Sunday
  preferences: mockPreferences
};

describe('TrainingScheduler', () => {
  test('should create scheduler with valid parameters', () => {
    const scheduler = new TrainingScheduler(baseParams);
    expect(scheduler).toBeDefined();
  });

  test('should throw error for missing start date', () => {
    const invalidParams = { ...baseParams, startDate: undefined as any };
    expect(() => new TrainingScheduler(invalidParams)).toThrow('Start date is required');
  });

  test('should throw error for empty workout days', () => {
    const invalidParams = { ...baseParams, workoutDays: [] };
    expect(() => new TrainingScheduler(invalidParams)).toThrow('At least one workout day must be specified');
  });

  test('should throw error for invalid workout days', () => {
    const invalidParams = { ...baseParams, workoutDays: [0, 8] };
    expect(() => new TrainingScheduler(invalidParams)).toThrow('Workout days must be between 1 (Monday) and 7 (Sunday)');
  });

  test('should throw error for missing preferences', () => {
    const invalidParams = { ...baseParams, preferences: undefined as any };
    expect(() => new TrainingScheduler(invalidParams)).toThrow('Training preferences are required');
  });

  test('should generate complete scheduled training plan', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    expect(plan).toBeDefined();
    expect(plan.startDate).toEqual(baseParams.startDate);
    expect(plan.totalWeeks).toBe(14);
    expect(plan.workouts).toBeDefined();
    expect(plan.workouts.length).toBeGreaterThan(0);
    expect(plan.summary).toBeDefined();
  });

  test('should include all workout types in plan', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    const workoutTypes = new Set(plan.workouts.map(w => w.type));
    expect(workoutTypes.size).toBeGreaterThan(1); // Should have multiple workout types
    
    // Check summary has counts for different workout types
    expect(plan.summary.totalWorkouts).toBeGreaterThan(0);
    expect(plan.summary.tempoRuns).toBeGreaterThan(0);
    expect(plan.summary.intervalSessions).toBeGreaterThan(0);
    expect(plan.summary.longRuns).toBeGreaterThan(0);
  });

  test('should schedule workouts on specified days only', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    for (const workout of plan.workouts) {
      const dayOfWeek = workout.scheduledDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
      expect(baseParams.workoutDays).toContain(adjustedDay);
    }
  });

  test('should have workouts spanning 14 weeks', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    const weeks = new Set(plan.workouts.map(w => w.week));
    expect(weeks.size).toBe(14);
    expect(Math.min(...weeks)).toBe(1);
    expect(Math.max(...weeks)).toBe(14);
  });

  test('should include required workout properties', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    for (const workout of plan.workouts) {
      expect(workout.name).toBeDefined();
      expect(workout.description).toBeDefined();
      expect(workout.type).toBeDefined();
      expect(workout.week).toBeGreaterThan(0);
      expect(workout.week).toBeLessThanOrEqual(14);
      expect(workout.day).toBeGreaterThan(0);
      expect(workout.day).toBeLessThanOrEqual(7);
      expect(workout.scheduledDate).toBeInstanceOf(Date);
      expect(workout.instructions).toBeDefined();
      expect(Array.isArray(workout.instructions)).toBe(true);
      expect(workout.workoutData).toBeDefined();
    }
  });

  test('should handle different goal marathon times', () => {
    const fastParams = { ...baseParams, goalMarathonTime: '03:30:00' };
    const slowParams = { ...baseParams, goalMarathonTime: '05:00:00' };

    const fastScheduler = new TrainingScheduler(fastParams);
    const slowScheduler = new TrainingScheduler(slowParams);

    const fastPlan = fastScheduler.generateScheduledPlan();
    const slowPlan = slowScheduler.generateScheduledPlan();

    expect(fastPlan.workouts.length).toBe(slowPlan.workouts.length);
    
    // Find tempo runs to compare paces
    const fastTempo = fastPlan.workouts.find(w => w.type === 'TEMPO_RUN');
    const slowTempo = slowPlan.workouts.find(w => w.type === 'TEMPO_RUN');
    
    if (fastTempo && slowTempo) {
      expect(fastTempo.pace).not.toBe(slowTempo.pace);
    }
  });

  test('should generate workouts with proper progression', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    // Check that long runs generally increase in distance over time
    const longRuns = plan.workouts
      .filter(w => w.type === 'LONG_RUN')
      .sort((a, b) => a.week - b.week);

    if (longRuns.length > 2) {
      const earlyLongRun = longRuns[0];
      const midLongRun = longRuns[Math.floor(longRuns.length / 2)];
      
      if (earlyLongRun && midLongRun && earlyLongRun.distance && midLongRun.distance) {
        expect(midLongRun.distance).toBeGreaterThan(earlyLongRun.distance);
      }
    }
  });

  test('should handle different workout day configurations', () => {
    const threeDayParams = { ...baseParams, workoutDays: [2, 4, 7] }; // 3 days
    const fiveDayParams = { ...baseParams, workoutDays: [1, 2, 4, 6, 7] }; // 5 days

    const threeDayScheduler = new TrainingScheduler(threeDayParams);
    const fiveDayScheduler = new TrainingScheduler(fiveDayParams);

    const threeDayPlan = threeDayScheduler.generateScheduledPlan();
    const fiveDayPlan = fiveDayScheduler.generateScheduledPlan();

    expect(fiveDayPlan.workouts.length).toBeGreaterThan(threeDayPlan.workouts.length);
  });

  test('should maintain workout data integrity', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    for (const workout of plan.workouts) {
      // Verify workout data matches the workout type
      switch (workout.type) {
        case 'TEMPO_RUN':
          expect(workout.workoutData).toHaveProperty('targetPace');
          expect(workout.workoutData).toHaveProperty('totalDistance');
          break;
        case 'INTERVAL_800M':
          expect(workout.workoutData).toHaveProperty('intervals');
          expect(workout.intervals).toBeDefined();
          break;
        case 'LONG_RUN':
          expect(workout.workoutData).toHaveProperty('targetEasyPace');
          expect(workout.workoutData).toHaveProperty('estimatedDuration');
          break;
      }
    }
  });

  test('should calculate accurate plan summary', () => {
    const scheduler = new TrainingScheduler(baseParams);
    const plan = scheduler.generateScheduledPlan();

    const actualCounts = {
      total: plan.workouts.length,
      tempo: plan.workouts.filter(w => w.type === 'TEMPO_RUN').length,
      interval: plan.workouts.filter(w => w.type === 'INTERVAL_800M').length,
      long: plan.workouts.filter(w => w.type === 'LONG_RUN').length,
      easy: plan.workouts.filter(w => w.type === 'EASY_RUN').length
    };

    expect(plan.summary.totalWorkouts).toBe(actualCounts.total);
    expect(plan.summary.tempoRuns).toBe(actualCounts.tempo);
    expect(plan.summary.intervalSessions).toBe(actualCounts.interval);
    expect(plan.summary.longRuns).toBe(actualCounts.long);
    expect(plan.summary.easyRuns).toBe(actualCounts.easy);
  });

  test('should handle edge case start dates', () => {
    // Test with different start dates
    const mondayStart = { ...baseParams, startDate: new Date('2024-01-01') }; // Monday
    const fridayStart = { ...baseParams, startDate: new Date('2024-01-05') }; // Friday

    const mondayScheduler = new TrainingScheduler(mondayStart);
    const fridayScheduler = new TrainingScheduler(fridayStart);

    const mondayPlan = mondayScheduler.generateScheduledPlan();
    const fridayPlan = fridayScheduler.generateScheduledPlan();

    expect(mondayPlan.workouts.length).toBe(fridayPlan.workouts.length);
    expect(mondayPlan.totalWeeks).toBe(fridayPlan.totalWeeks);
  });

  test('should perform within acceptable time limits', () => {
    const scheduler = new TrainingScheduler(baseParams);
    
    const startTime = Date.now();
    const plan = scheduler.generateScheduledPlan();
    const endTime = Date.now();
    
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    expect(plan.workouts.length).toBeGreaterThan(0);
  });
}); 