import { 
  WorkoutSchedule, 
  generateFullPlanSchedule, 
  assignWorkoutTypes, 
  calculatePlanEndDate,
  formatDateForDB 
} from './date-utils';
import { generateTempoRun } from './tempo-runs';
import { generateIntervalWorkout } from './intervals';
import { generateLongRun } from './long-runs';
import { TrainingPreferences, TempoRunWorkout, IntervalWorkout, LongRunWorkout } from '@/types/training';
import { WorkoutType } from '@/generated/prisma';
import { DistanceUnit } from '@/generated/prisma';

export interface ScheduledWorkout {
  id?: string;
  name: string;
  description: string;
  type: WorkoutType;
  week: number;
  day: number; // Day of week (1=Monday, 7=Sunday)
  scheduledDate: Date;
  distance?: number; // in kilometers
  duration?: number; // in minutes
  pace?: string;
  intervals?: any; // JSON data for interval workouts
  instructions: string[];
  workoutData: TempoRunWorkout | IntervalWorkout | LongRunWorkout;
  // Race day specific properties (only for Week 14)
  isRaceDay?: boolean;
  raceDetails?: {
    startTime: string;
    location: string;
    instructions: string;
  };
  structure: string;
}

export interface TrainingSchedulerParams {
  startDate: Date;
  raceDate?: Date; // Optional race date - if provided, will be used as the actual end date
  goalMarathonTime?: string;
  workoutDays: number[]; // Array of preferred workout days (1=Monday, 7=Sunday)
  preferences: TrainingPreferences;
}

export interface ScheduledTrainingPlan {
  startDate: Date;
  endDate: Date;
  totalWeeks: number;
  workouts: ScheduledWorkout[];
  summary: {
    totalWorkouts: number;
    tempoRuns: number;
    intervalSessions: number;
    longRuns: number;
    marathonRaces: number;
    easyRuns: number;
  };
}

/**
 * Main training scheduler class that coordinates all algorithms with calendar dates
 */
export class TrainingScheduler {
  private params: TrainingSchedulerParams;

  constructor(params: TrainingSchedulerParams) {
    this.params = params;
    this.validateParams();
  }

  /**
   * Validate scheduler parameters
   */
  private validateParams(): void {
    if (!this.params.startDate) {
      throw new Error('Start date is required');
    }

    if (!this.params.workoutDays || this.params.workoutDays.length === 0) {
      throw new Error('At least one workout day must be specified');
    }

    if (this.params.workoutDays.some(day => day < 1 || day > 7)) {
      throw new Error('Workout days must be between 1 (Monday) and 7 (Sunday)');
    }

    if (!this.params.preferences) {
      throw new Error('Training preferences are required');
    }
  }

  /**
   * Generate the complete scheduled training plan
   */
  public generateScheduledPlan(): ScheduledTrainingPlan {
    // Generate the base schedule with dates and workout types
    const baseSchedule = generateFullPlanSchedule(
      this.params.startDate,
      this.params.workoutDays,
      this.params.raceDate // Pass race date for Week 14 special handling
    );

    // Assign workout types based on the schedule pattern
    const typedSchedule = assignWorkoutTypes(baseSchedule);

    // Generate actual workouts for each scheduled date
    const scheduledWorkouts = this.generateWorkoutsFromSchedule(typedSchedule);

    // Calculate plan summary
    const summary = this.calculatePlanSummary(scheduledWorkouts);

    return {
      startDate: this.params.startDate,
      endDate: this.params.raceDate || calculatePlanEndDate(this.params.startDate),
      totalWeeks: 14,
      workouts: scheduledWorkouts,
      summary
    };
  }

  /**
   * Generate actual workout objects from the schedule
   */
  private generateWorkoutsFromSchedule(schedule: WorkoutSchedule[]): ScheduledWorkout[] {
    const workouts: ScheduledWorkout[] = [];

    for (const scheduleItem of schedule) {
      let workout: ScheduledWorkout;

      switch (scheduleItem.workoutType) {
        case 'tempo':
          workout = this.createTempoWorkout(scheduleItem);
          break;
        case 'interval':
          workout = this.createIntervalWorkout(scheduleItem);
          break;
        case 'long':
          workout = this.createLongRunWorkout(scheduleItem);
          break;
        case 'easy':
          workout = this.createEasyRunWorkout(scheduleItem);
          break;
        default:
          // Skip rest days or unknown workout types
          continue;
      }

      workouts.push(workout);
    }

    return workouts;
  }

  /**
   * Create a scheduled tempo run workout
   */
  private createTempoWorkout(schedule: WorkoutSchedule): ScheduledWorkout {
    const tempoRun = generateTempoRun({
      goalMarathonTime: this.params.goalMarathonTime || '04:00:00',
      week: schedule.week,
      preferences: this.params.preferences
    });

    // Convert distance to kilometers for database storage
    // Use totalDistance to include warm-up and cool-down in the workout card display
    const distanceInKm = this.params.preferences.distanceUnit === DistanceUnit.MILES 
      ? tempoRun.totalDistance * 1.60934 // Convert miles to km
      : tempoRun.totalDistance; // Already in km

    return {
      name: tempoRun.name,
      description: tempoRun.description,
      type: WorkoutType.TEMPO_RUN,
      week: schedule.week,
      day: schedule.dayOfWeek,
      scheduledDate: schedule.date,
      distance: distanceInKm, // Store in kilometers for database
      duration: tempoRun.estimatedDuration,
      pace: tempoRun.targetPace,
      instructions: tempoRun.instructions,
      workoutData: tempoRun,
      structure: tempoRun.structure
    };
  }

  /**
   * Create a scheduled interval workout
   */
  private createIntervalWorkout(schedule: WorkoutSchedule): ScheduledWorkout {
    const intervalWorkout = generateIntervalWorkout({
      goalMarathonTime: this.params.goalMarathonTime || '04:00:00',
      week: schedule.week,
      preferences: this.params.preferences
    });

    // Convert distance to kilometers for database storage
    const distanceInKm = this.params.preferences.distanceUnit === DistanceUnit.MILES 
      ? intervalWorkout.totalDistance * 1.60934 // Convert miles to km
      : intervalWorkout.totalDistance; // Already in km

    return {
      name: intervalWorkout.name,
      description: intervalWorkout.description,
      type: WorkoutType.INTERVAL_800M,
      week: schedule.week,
      day: schedule.dayOfWeek,
      scheduledDate: schedule.date,
      distance: distanceInKm, // Store in kilometers for database
      duration: intervalWorkout.estimatedDuration,
      pace: intervalWorkout.intervals[0]?.targetPace,
      intervals: intervalWorkout.intervals,
      instructions: intervalWorkout.instructions,
      workoutData: intervalWorkout,
      structure: intervalWorkout.structure
    };
  }

  /**
   * Create a scheduled long run workout
   */
  private createLongRunWorkout(schedule: WorkoutSchedule): ScheduledWorkout {
    const longRun = generateLongRun({
      goalMarathonTime: this.params.goalMarathonTime || '04:00:00',
      week: schedule.week,
      preferences: this.params.preferences
    });

    // Convert distance to kilometers for database storage
    const distanceInKm = this.params.preferences.distanceUnit === DistanceUnit.MILES 
      ? longRun.totalDistance * 1.60934 // Convert miles to km
      : longRun.totalDistance; // Already in km

    return {
      name: longRun.name,
      description: longRun.description,
      type: longRun.type, // This will be MARATHON_RACE for Week 14, LONG_RUN for others
      week: schedule.week,
      day: schedule.dayOfWeek,
      scheduledDate: schedule.date,
      distance: distanceInKm, // Store in kilometers for database
      duration: longRun.estimatedDuration,
      pace: longRun.targetMarathonPace, // Use marathon pace for race day
      instructions: longRun.instructions,
      workoutData: longRun,
      structure: longRun.structure,
      // Add race day specific properties for Week 14
      ...(schedule.week === 14 && longRun.isRaceDay && {
        isRaceDay: true,
        raceDetails: longRun.raceDetails
      })
    };
  }

  /**
   * Create a scheduled easy run workout
   */
  private createEasyRunWorkout(schedule: WorkoutSchedule): ScheduledWorkout {
    const easyRunDistance = this.calculateEasyRunDistance(schedule.week);
    const easyPace = this.calculateEasyPace();
    
    // Convert distance to kilometers for database storage
    const distanceInKm = this.params.preferences.distanceUnit === DistanceUnit.MILES 
      ? easyRunDistance * 1.60934 // Convert miles to km
      : easyRunDistance; // Already in km

    const unit = this.params.preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
    const unitSingular = this.params.preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
    const structure = `Easy run (${easyRunDistance.toFixed(1)} ${easyRunDistance === 1 ? unitSingular : unit})`;

    return {
      name: `Week ${schedule.week} Easy Run`,
      description: `${easyRunDistance.toFixed(1)} ${unit} easy run`,
      type: WorkoutType.EASY_RUN,
      week: schedule.week,
      day: schedule.dayOfWeek,
      scheduledDate: schedule.date,
      distance: distanceInKm, // Store in kilometers for database
      duration: Math.round(easyRunDistance * 10), // Rough estimate: 10 minutes per km/mile
      pace: easyPace,
      instructions: [
        `Run ${easyRunDistance.toFixed(1)} ${unit} at an easy, conversational pace`,
        'You should be able to hold a conversation throughout the run',
        'Focus on building aerobic base and recovery'
      ],
      workoutData: {
        distance: easyRunDistance,
        pace: easyPace,
        type: WorkoutType.EASY_RUN
      } as any,
      structure
    };
  }

  /**
   * Calculate easy run distance based on week
   */
  private calculateEasyRunDistance(week: number): number {
    // Progressive easy run distances (in km, converted if needed)
    const baseDistances = {
      1: 5, 2: 6, 3: 6, 4: 7, 5: 7, 6: 8, 7: 8,
      8: 9, 9: 9, 10: 10, 11: 8, 12: 7, 13: 6, 14: 5
    };

    const distanceKm = baseDistances[week as keyof typeof baseDistances] || 6;
    
    // Convert to miles if needed
    return this.params.preferences.distanceUnit === DistanceUnit.MILES 
      ? distanceKm * 0.621371 
      : distanceKm;
  }

  /**
   * Calculate plan summary statistics
   */
  private calculatePlanSummary(workouts: ScheduledWorkout[]) {
    const summary = {
      totalWorkouts: workouts.length,
      tempoRuns: 0,
      intervalSessions: 0,
      longRuns: 0,
      marathonRaces: 0,
      easyRuns: 0
    };

    for (const workout of workouts) {
      switch (workout.type) {
        case WorkoutType.TEMPO_RUN:
          summary.tempoRuns++;
          break;
        case WorkoutType.INTERVAL_800M:
          summary.intervalSessions++;
          break;
        case WorkoutType.LONG_RUN:
          summary.longRuns++;
          break;
        case WorkoutType.MARATHON_RACE:
          summary.marathonRaces++;
          break;
        case WorkoutType.EASY_RUN:
          summary.easyRuns++;
          break;
      }
    }

    return summary;
  }

  /**
   * Get workouts for a specific week
   */
  public getWorkoutsForWeek(week: number): ScheduledWorkout[] {
    const plan = this.generateScheduledPlan();
    return plan.workouts.filter(workout => workout.week === week);
  }

  /**
   * Get workouts for a specific date range
   */
  public getWorkoutsForDateRange(startDate: Date, endDate: Date): ScheduledWorkout[] {
    const plan = this.generateScheduledPlan();
    return plan.workouts.filter(workout => 
      workout.scheduledDate >= startDate && workout.scheduledDate <= endDate
    );
  }

  /**
   * Convert scheduled workouts to database format
   */
  public convertToDBFormat(trainingPlanId: string): any[] {
    const plan = this.generateScheduledPlan();
    
    return plan.workouts.map(workout => ({
      name: workout.name,
      description: workout.description,
      type: workout.type,
      week: workout.week,
      day: workout.day,
      distance: workout.distance,
      duration: workout.duration,
      pace: workout.pace,
      intervals: workout.intervals ? JSON.stringify(workout.intervals) : null,
      isRaceDay: workout.isRaceDay || false,
      raceDetails: workout.raceDetails ? JSON.stringify(workout.raceDetails) : null,
      trainingPlanId,
      scheduledDate: formatDateForDB(workout.scheduledDate),
      structure: workout.structure
    }));
  }

  /**
   * Calculate easy pace based on marathon goal time
   */
  private calculateEasyPace(): string {
    // Easy pace is typically 1:30-2:00 slower than marathon pace
    // For simplicity, we'll use 1:45 slower than marathon pace
    const marathonTime = this.params.goalMarathonTime || '04:00:00';
    const timeParts = marathonTime.split(':').map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const seconds = timeParts[2] || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const marathonPacePerMile = totalSeconds / 26.2; // seconds per mile
    
    // Add 105 seconds (1:45) for easy pace
    const easyPaceSeconds = marathonPacePerMile + 105;
    
    const easyMinutes = Math.floor(easyPaceSeconds / 60);
    const easySecondsRemainder = Math.round(easyPaceSeconds % 60);
    
    // Convert to user's preferred unit if needed
    if (this.params.preferences.distanceUnit === DistanceUnit.KILOMETERS) {
      // Convert from per-mile to per-km (divide by 1.60934)
      const easyPacePerKm = easyPaceSeconds / 1.60934;
      const kmMinutes = Math.floor(easyPacePerKm / 60);
      const kmSeconds = Math.round(easyPacePerKm % 60);
      return `${kmMinutes}:${kmSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${easyMinutes}:${easySecondsRemainder.toString().padStart(2, '0')}`;
  }
} 