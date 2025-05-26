import { ExperienceLevel, WorkoutType } from '../../generated/prisma';
import { TrainingPreferences, MarathonTime, IntervalSet, IntervalWorkout } from '@/types/training';
import { formatPaceForUser } from './pace-calculator';

export interface IntervalParams {
  goalMarathonTime: string;
  week: number;
  preferences: TrainingPreferences;
}

/**
 * Get number of 800m repetitions for a specific week
 * Fixed progression for all runners regardless of experience level
 */
function getIntervalRepetitions(week: number): number {
  const repProgression: { [key: number]: number } = {
    1: 2,   // 2 x 800m repeats
    2: 3,   // 3 x 800m repeats
    3: 4,   // 4 x 800m repeats
    4: 5,   // 5 x 800m repeats
    5: 6,   // 6 x 800m repeats
    6: 7,   // 7 x 800m repeats
    7: 8,   // 8 x 800m repeats
    8: 9,   // 9 x 800m repeats
    9: 10,  // 10 x 800m repeats (PEAK)
    10: 10, // 10 x 800m repeats (PEAK)
    11: 8,  // 8 x 800m repeats
    12: 6,  // 6 x 800m repeats
    13: 4,  // 4 x 800m repeats
    14: 2   // 2 x 800m repeats
  };

  const reps = repProgression[week];
  if (!reps) {
    throw new Error(`Invalid week: ${week}. Must be between 1 and 14.`);
  }

  return reps;
}

/**
 * Calculate interval pace using the hour→minute, minute→second conversion method
 * Example: 3 hours 15 minutes marathon → 3:15 per 800m/0.5 mile
 */
function calculateIntervalPace(marathonTime: MarathonTime): { paceSeconds: number; recoverySeconds: number } {
  // Convert marathon time to total minutes
  const totalMinutes = marathonTime.hours * 60 + marathonTime.minutes;
  
  // Convert to MM:SS format for intervals
  const intervalMinutes = Math.floor(totalMinutes / 60); // hours become minutes
  const intervalSeconds = totalMinutes % 60; // minutes become seconds
  
  // Convert to total seconds for consistency
  const paceSeconds = intervalMinutes * 60 + intervalSeconds;
  
  // Recovery time matches interval pace time
  const recoverySeconds = paceSeconds;
  
  return { paceSeconds, recoverySeconds };
}

/**
 * Generate a single 800m interval workout
 * Uses proven methodology: marathon time conversion for pace calculation
 */
export function generateIntervalWorkout(params: IntervalParams): IntervalWorkout {
  const { goalMarathonTime, week, preferences } = params;
  
  if (!goalMarathonTime) {
    throw new Error('Goal marathon time is required for interval generation');
  }
  
  // Parse marathon time (format: "HH:MM:SS")
  const timeParts = goalMarathonTime.split(':').map(Number);
  if (timeParts.length !== 3 || timeParts.some(part => isNaN(part))) {
    throw new Error('Invalid marathon time format. Expected HH:MM:SS');
  }
  
  const hours = timeParts[0]!;
  const minutes = timeParts[1]!;
  const seconds = timeParts[2]!;
  const marathonTime: MarathonTime = { hours, minutes, seconds };
  
  // Calculate interval pace and recovery time
  const { paceSeconds, recoverySeconds } = calculateIntervalPace(marathonTime);
  
  // Get number of repetitions for this week
  const repetitions = getIntervalRepetitions(week);
  
  // 800m = 0.5 miles
  const intervalDistance = preferences.distanceUnit === 'KILOMETERS' ? 0.8 : 0.5;
  
  // Warm-up and cool-down distances
  const warmUpDistance = preferences.distanceUnit === 'KILOMETERS' ? 3.2 : 2; // 2 miles
  const coolDownDistance = preferences.distanceUnit === 'KILOMETERS' ? 1.6 : 1; // 1 mile
  
  // Create interval set
  const intervalSet: IntervalSet = {
    distance: intervalDistance,
    repetitions,
    targetPace: formatIntervalPace(paceSeconds, preferences),
    recoveryTime: recoverySeconds
  };
  
  // Calculate total distance
  const intervalTotalDistance = intervalDistance * repetitions;
  const totalDistance = warmUpDistance + intervalTotalDistance + coolDownDistance;
  
  // Estimate duration
  const warmUpTime = warmUpDistance * 8; // 8 min/mile easy pace
  const intervalTime = repetitions * (paceSeconds + recoverySeconds) / 60; // convert to minutes
  const coolDownTime = coolDownDistance * 8; // 8 min/mile easy pace
  const estimatedDuration = Math.round(warmUpTime + intervalTime + coolDownTime);
  
  // Generate instructions
  const instructions = getIntervalInstructions(
    repetitions, 
    intervalSet.targetPace, 
    recoverySeconds,
    preferences
  );
  
  return {
    name: `Week ${week} 800m Intervals`,
    description: `${repetitions} x 800m intervals with ${Math.floor(recoverySeconds / 60)}:${(recoverySeconds % 60).toString().padStart(2, '0')} recovery`,
    type: WorkoutType.INTERVAL_800M,
    week,
    warmUpDistance,
    coolDownDistance,
    intervals: [intervalSet],
    totalDistance,
    estimatedDuration,
    instructions
  };
}

/**
 * Format interval pace for display
 */
function formatIntervalPace(paceSeconds: number, preferences: TrainingPreferences): string {
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = paceSeconds % 60;
  const unit = preferences.distanceUnit === 'KILOMETERS' ? 'km' : 'mile';
  return `${minutes}:${seconds.toString().padStart(2, '0')} per ${unit}`;
}

/**
 * Generate instructions for interval workouts
 */
function getIntervalInstructions(
  repetitions: number,
  targetPace: string,
  recoverySeconds: number,
  preferences: TrainingPreferences
): string[] {
  const unit = preferences.distanceUnit === 'KILOMETERS' ? '800m' : '0.5 mile';
  const warmUpCoolDown = preferences.distanceUnit === 'KILOMETERS' ? '3.2km' : '2 miles';
  const coolDown = preferences.distanceUnit === 'KILOMETERS' ? '1.6km' : '1 mile';
  const recoveryTime = `${Math.floor(recoverySeconds / 60)}:${(recoverySeconds % 60).toString().padStart(2, '0')}`;
  
  return [
    `Warm up with ${warmUpCoolDown} easy jog`,
    `Run ${repetitions} x ${unit} at ${targetPace}`,
    `Recovery: ${recoveryTime} easy jog/walk between intervals`,
    `Cool down with ${coolDown} easy jog`,
    'Interval pace should feel like your 5K race pace - hard but sustainable',
    'Recovery time matches your interval time - use it fully to prepare for the next rep',
    'Focus on completing all repetitions rather than hitting exact pace',
    'Walk during recovery if needed - full recovery is more important than jogging',
    'Maintain good running form even when fatigued'
  ];
}

/**
 * Generates all 800m interval workouts for a 14-week training plan
 */
export function generateAllIntervalWorkouts(params: Omit<IntervalParams, 'week'>): IntervalWorkout[] {
  const intervalWorkouts: IntervalWorkout[] = [];
  
  for (let week = 1; week <= 14; week++) {
    const intervalWorkout = generateIntervalWorkout({ ...params, week });
    intervalWorkouts.push(intervalWorkout);
  }
  
  return intervalWorkouts;
}

/**
 * Gets the recommended interval pace
 */
export function getRecommendedIntervalPace(
  goalMarathonTime?: string,
  preferences?: TrainingPreferences
): string {
  if (!goalMarathonTime || !preferences) {
    throw new Error('Goal marathon time and preferences are required');
  }
  
  // Parse marathon time
  const timeParts = goalMarathonTime.split(':').map(Number);
  if (timeParts.length !== 3 || timeParts.some(part => isNaN(part))) {
    throw new Error('Invalid marathon time format. Expected HH:MM:SS');
  }
  
  const hours = timeParts[0]!;
  const minutes = timeParts[1]!;
  const seconds = timeParts[2]!;
  const marathonTime: MarathonTime = { hours, minutes, seconds };
  
  const { paceSeconds } = calculateIntervalPace(marathonTime);
  return formatIntervalPace(paceSeconds, preferences);
}

/**
 * Calculate training stress for interval workout
 */
export function calculateIntervalTrainingStress(workout: IntervalWorkout): number {
  // Simple stress calculation based on total interval distance and intensity
  const totalIntervalDistance = workout.intervals.reduce((sum, set) => 
    sum + (set.distance * set.repetitions), 0
  );
  
  // High intensity multiplier for intervals
  const intensityMultiplier = 2.5;
  
  return Math.round(totalIntervalDistance * intensityMultiplier);
} 