import { ExperienceLevel, WorkoutType, DistanceUnit } from '../../generated/prisma';
import { TrainingPreferences, MarathonTime, IntervalSet, IntervalWorkout } from '@/types/training';
import { formatPaceForUser } from './pace-calculator';

export interface IntervalParams {
  goalMarathonTime?: string;
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
 * Calculate interval pace and recovery time based on marathon goal time
 * Interval pace should be approximately 5K race pace, which is about 30-45 seconds faster than marathon pace per mile
 */
function calculateIntervalPace(marathonTime: MarathonTime): { paceSeconds: number; recoverySeconds: number } {
  // Convert marathon time to total seconds
  const totalMarathonSeconds = marathonTime.hours * 3600 + marathonTime.minutes * 60 + marathonTime.seconds;
  
  // Calculate marathon pace per mile in seconds
  const marathonPacePerMileSeconds = totalMarathonSeconds / 26.2;
  
  // Interval pace is approximately 35 seconds faster than marathon pace per mile
  // This approximates 5K race pace
  const intervalPacePerMileSeconds = marathonPacePerMileSeconds - 35;
  
  // Convert to per-km if needed (will be handled in formatting)
  const paceSeconds = Math.round(intervalPacePerMileSeconds);
  
  // Recovery time for 800m intervals should be 90-180 seconds based on fitness level
  // Faster runners get shorter recovery, slower runners get longer recovery
  // Base recovery on marathon time: sub-3:30 = 90s, 3:30-4:30 = 120s, 4:30+ = 150s
  let recoverySeconds = 120; // default 2 minutes
  if (totalMarathonSeconds < 12600) { // sub-3:30
    recoverySeconds = 90;
  } else if (totalMarathonSeconds > 16200) { // over 4:30
    recoverySeconds = 150;
  }
  
  return { paceSeconds, recoverySeconds };
}

/**
 * Generate a single 800m interval workout
 * Uses proven methodology: marathon time conversion for pace calculation
 */
export function generateIntervalWorkout(params: IntervalParams): IntervalWorkout {
  const { week, preferences } = params;
  
  // Use default marathon time if none provided (4:00:00 is a common goal)
  const goalMarathonTime = params.goalMarathonTime || '4:00:00';
  
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
  const intervalDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 0.8 : 0.5;
  
  // Warm-up and cool-down distances
  const warmUpDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 3.2 : 2; // 2 miles
  const coolDownDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 1.6 : 1; // 1 mile
  
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
  
  // Get structure
  const structure = getIntervalStructure(
    warmUpDistance,
    intervalDistance,
    repetitions,
    coolDownDistance,
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
    instructions,
    structure
  };
}

/**
 * Format interval pace for display
 */
function formatIntervalPace(paceSeconds: number, preferences: TrainingPreferences): string {
  let displayPaceSeconds = paceSeconds;
  
  // If user prefers kilometers, convert from per-mile to per-km
  if (preferences.distanceUnit === DistanceUnit.KILOMETERS) {
    displayPaceSeconds = paceSeconds / 1.60934; // Convert from per-mile to per-km
  }
  
  const minutes = Math.floor(displayPaceSeconds / 60);
  const seconds = Math.round(displayPaceSeconds % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get detailed structure breakdown for interval workouts
 */
function getIntervalStructure(
  warmUpDistance: number,
  intervalDistance: number,
  repetitions: number,
  coolDownDistance: number,
  preferences: TrainingPreferences
): string {
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const unitSingular = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const intervalUnit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '800m' : '0.5 mile';
  
  const warmUpText = `Warm-up (${warmUpDistance.toFixed(1)} ${warmUpDistance === 1 ? unitSingular : unit})`;
  const intervalText = `${repetitions} x ${intervalUnit} intervals with recovery`;
  const coolDownText = `Cool-down (${coolDownDistance.toFixed(1)} ${coolDownDistance === 1 ? unitSingular : unit})`;
  
  return `${warmUpText} → ${intervalText} → ${coolDownText}`;
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
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '800m' : '0.5 mile';
  const warmUpCoolDown = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '3.2km' : '2 miles';
  const coolDown = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '1.6km' : '1 mile';
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