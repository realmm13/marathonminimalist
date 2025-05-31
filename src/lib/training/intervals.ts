import { ExperienceLevel, WorkoutType, DistanceUnit } from '../../generated/prisma';
import { TrainingPreferences, MarathonTime, IntervalSet, IntervalWorkout } from '@/types/training';
import { formatPaceForUser, calculateTrainingPaces, parseTimeString, paceTimeToSeconds, secondsToPaceTime, formatPaceTime } from './pace-calculator';

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
 * Calculate 5K pace using the correct formula: marathon hours→minutes, minutes→seconds
 * Example: 3:15:00 marathon → 3:15 per 800m (which equals 6:30/mile pace)
 */
function calculate5KPaceFromMarathonTime(marathonTime: MarathonTime): { 
  paceSeconds: number; 
  intervalTimeSeconds: number; 
  recoveryTimeSeconds: number;
  paceDisplay: string;
} {
  // Use the proven formula: marathon hours become minutes, marathon minutes become seconds
  // Example: 3:15:00 marathon → 3:15 per 800m
  const intervalMinutes = marathonTime.hours;
  const intervalSeconds = marathonTime.minutes;
  
  // This is the time for 800m (0.5 miles)
  const intervalTimeSeconds = intervalMinutes * 60 + intervalSeconds;
  
  // Calculate pace per mile: if 800m takes X seconds, then 1 mile takes X * 2 seconds
  const paceSecondsPerMile = intervalTimeSeconds * 2;
  
  // Recovery time equals interval time (as specified in requirements)
  const recoveryTimeSeconds = intervalTimeSeconds;
  
  // Format the pace display (e.g., "6:30/mi")
  const paceMinutes = Math.floor(paceSecondsPerMile / 60);
  const paceSecondsRemainder = Math.round(paceSecondsPerMile % 60);
  const paceDisplay = `${paceMinutes}:${paceSecondsRemainder.toString().padStart(2, '0')}`;
  
  return { 
    paceSeconds: paceSecondsPerMile, 
    intervalTimeSeconds, 
    recoveryTimeSeconds,
    paceDisplay
  };
}

/**
 * Calculate easy pace for warm-up and cool-down
 */
function calculateEasyPace(marathonTime: MarathonTime): string {
  // Easy pace is typically 60-90 seconds slower than marathon pace
  const totalMarathonSeconds = marathonTime.hours * 3600 + marathonTime.minutes * 60 + marathonTime.seconds;
  const marathonPacePerMileSeconds = totalMarathonSeconds / 26.2;
  const easyPaceSeconds = Math.max(marathonPacePerMileSeconds + 75, 540); // At least 9:00/mile
  
  const minutes = Math.floor(easyPaceSeconds / 60);
  const seconds = Math.round(easyPaceSeconds % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Generate a single 800m interval workout
 * Uses the correct 5K pace formula: marathon hours→minutes, minutes→seconds
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
  
  // Calculate 5K pace and timing using the correct formula
  const { paceSeconds, intervalTimeSeconds, recoveryTimeSeconds, paceDisplay } = calculate5KPaceFromMarathonTime(marathonTime);
  
  // Calculate easy pace for warm-up and cool-down
  const easyPace = calculateEasyPace(marathonTime);
  
  // Get number of repetitions for this week
  const repetitions = getIntervalRepetitions(week);
  
  // 800m = 0.5 miles
  const intervalDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 0.8 : 0.5;
  
  // Warm-up and cool-down distances
  const warmUpDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 3.2 : 2; // 2 miles
  const coolDownDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 1.6 : 1; // 1 mile
  
  // Format interval pace for user's preferred unit
  const intervalPaceFormatted = formatIntervalPace(paceSeconds, preferences);
  
  // Create interval set
  const intervalSet: IntervalSet = {
    distance: intervalDistance,
    repetitions,
    targetPace: intervalPaceFormatted,
    recoveryTime: recoveryTimeSeconds
  };
  
  // Calculate total distance
  const intervalTotalDistance = intervalDistance * repetitions;
  const totalDistance = warmUpDistance + intervalTotalDistance + coolDownDistance;
  
  // Estimate duration more accurately
  const warmUpTime = warmUpDistance * (paceSeconds + 75) / 60; // Easy pace in minutes
  const intervalTime = repetitions * (intervalTimeSeconds + recoveryTimeSeconds) / 60; // Total interval work in minutes
  const coolDownTime = coolDownDistance * (paceSeconds + 75) / 60; // Easy pace in minutes
  const estimatedDuration = Math.round(warmUpTime + intervalTime + coolDownTime);
  
  // Generate instructions
  const instructions = getIntervalInstructions(
    repetitions, 
    intervalSet.targetPace, 
    recoveryTimeSeconds,
    intervalTimeSeconds,
    preferences
  );
  
  // Get structure with detailed pace information
  const structure = getIntervalStructure(
    warmUpDistance,
    intervalDistance,
    repetitions,
    coolDownDistance,
    easyPace,
    intervalPaceFormatted,
    intervalTimeSeconds,
    recoveryTimeSeconds,
    preferences
  );
  
  return {
    name: `Week ${week} 800m Intervals`,
    description: `${repetitions} x 800m intervals at ${intervalPaceFormatted} (${formatTime(intervalTimeSeconds)} per rep) with ${formatTime(recoveryTimeSeconds)} recovery`,
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
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format interval pace for display
 */
function formatIntervalPace(paceSecondsPerMile: number, preferences: TrainingPreferences): string {
  // Validate input
  if (isNaN(paceSecondsPerMile) || paceSecondsPerMile <= 0) {
    throw new Error(`Invalid pace: ${paceSecondsPerMile}`);
  }
  
  let displayPaceSeconds = paceSecondsPerMile;
  
  // If user prefers kilometers, convert from per-mile to per-km
  if (preferences.distanceUnit === DistanceUnit.KILOMETERS) {
    displayPaceSeconds = paceSecondsPerMile / 1.60934; // Convert from per-mile to per-km
  }
  
  const minutes = Math.floor(displayPaceSeconds / 60);
  const seconds = Math.round(displayPaceSeconds % 60);
  
  // Return just MM:SS format to match test expectations
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get detailed structure breakdown for interval workouts with pace information
 */
function getIntervalStructure(
  warmUpDistance: number,
  intervalDistance: number,
  repetitions: number,
  coolDownDistance: number,
  easyPace: string,
  intervalPace: string,
  intervalTimeSeconds: number,
  recoveryTimeSeconds: number,
  preferences: TrainingPreferences
): string {
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const unitSingular = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const intervalUnit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '800m' : '0.5 mile';
  const easyPaceUnit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mi';
  
  const warmUpText = `Warm-up (${warmUpDistance.toFixed(1)} ${warmUpDistance === 1 ? unitSingular : unit} at ${easyPace}/${easyPaceUnit})`;
  const intervalText = `${repetitions} x ${intervalUnit} at ${intervalPace} (${formatTime(intervalTimeSeconds)} per rep, ${formatTime(recoveryTimeSeconds)} recovery)`;
  const coolDownText = `Cool-down (${coolDownDistance.toFixed(1)} ${coolDownDistance === 1 ? unitSingular : unit} at ${easyPace}/${easyPaceUnit})`;
  
  return `${warmUpText} → ${intervalText} → ${coolDownText}`;
}

/**
 * Generate instructions for interval workouts
 */
function getIntervalInstructions(
  repetitions: number,
  targetPace: string,
  recoverySeconds: number,
  intervalTimeSeconds: number,
  preferences: TrainingPreferences
): string[] {
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '800m' : '0.5 mile';
  const warmUpCoolDown = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '3.2km' : '2 miles';
  const coolDown = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '1.6km' : '1 mile';
  const recoveryTime = formatTime(recoverySeconds);
  const intervalTime = formatTime(intervalTimeSeconds);
  
  return [
    `Warm up with ${warmUpCoolDown} easy jog`,
    `Run ${repetitions} x ${unit} at ${targetPace} (${intervalTime} per rep)`,
    `Recovery: ${recoveryTime} easy jog/walk between intervals`,
    `Cool down with ${coolDown} easy jog`,
    'Interval pace should feel like your 5K race pace - hard but sustainable',
    `Each ${unit} should take approximately ${intervalTime} to complete`,
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
  
  const { paceSeconds } = calculate5KPaceFromMarathonTime(marathonTime);
  return formatIntervalPace(paceSeconds, preferences);
} 