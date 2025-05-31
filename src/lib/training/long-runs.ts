import { ExperienceLevel, WorkoutType, DistanceUnit } from '../../generated/prisma';
import { TrainingPreferences, MarathonTime, LongRunWorkout } from '@/types/training';
import { calculateTrainingPaces, formatPaceForUser } from './pace-calculator';

export interface LongRunParams {
  goalMarathonTime: string;
  week: number;
  preferences: TrainingPreferences;
}

/**
 * Get slow run duration for a specific week (in minutes)
 * Fixed progression for all runners regardless of experience level
 */
function getSlowRunDuration(week: number): number {
  const durationProgression: { [key: number]: number } = {
    1: 90,   // 90 mins slow
    2: 90,   // 90 mins slow
    3: 100,  // 100 mins slow
    4: 100,  // 100 mins slow
    5: 110,  // 110 mins slow
    6: 110,  // 110 mins slow
    7: 120,  // 120 mins slow
    8: 120,  // 120 mins slow (PEAK)
    9: 120,  // 120 mins slow (PEAK)
    10: 110, // 110 mins slow
    11: 100, // 100 mins slow
    12: 80,  // 80 mins slow
    13: 60,  // 60 mins slow
    14: 0    // Race week - no slow run
  };

  const duration = durationProgression[week];
  if (duration === undefined) {
    throw new Error(`Invalid week: ${week}. Must be between 1 and 14.`);
  }

  return duration;
}

/**
 * Get marathon pace miles for a specific week
 * Fixed progression for all runners regardless of experience level
 */
function getMarathonPaceMiles(week: number): number {
  const mpProgression: { [key: number]: number } = {
    1: 1,   // 1 mile @ MP
    2: 2,   // 2 miles @ MP
    3: 3,   // 3 miles @ MP
    4: 4,   // 4 miles @ MP
    5: 5,   // 5 miles @ MP
    6: 6,   // 6 miles @ MP
    7: 6,   // 6 miles @ MP
    8: 6,   // 6 miles @ MP (PEAK)
    9: 6,   // 6 miles @ MP (PEAK)
    10: 6,  // 6 miles @ MP
    11: 6,  // 6 miles @ MP
    12: 6,  // 6 miles @ MP
    13: 6,  // 6 miles @ MP
    14: 4   // 4 miles @ MP (race week)
  };

  const miles = mpProgression[week];
  if (!miles) {
    throw new Error(`Invalid week: ${week}. Must be between 1 and 14.`);
  }

  return miles;
}

/**
 * Get detailed structure breakdown for long runs
 */
function getLongRunStructure(
  week: number,
  easyRunDistance: number,
  marathonPaceDistance: number,
  preferences: TrainingPreferences
): string {
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const unitSingular = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  
  if (week === 14) {
    // Race week - marathon pace only
    return `Marathon Race (${marathonPaceDistance.toFixed(1)} ${marathonPaceDistance === 1 ? unitSingular : unit})`;
  }
  
  const easyText = `Easy run (${easyRunDistance.toFixed(1)} ${easyRunDistance === 1 ? unitSingular : unit})`;
  const marathonText = `Marathon pace (${marathonPaceDistance.toFixed(1)} ${marathonPaceDistance === 1 ? unitSingular : unit})`;
  
  return `${easyText} → ${marathonText}`;
}

/**
 * Generate a single long run workout
 * Uses exact progression from the proven training plan
 */
export function generateLongRun(params: LongRunParams): LongRunWorkout {
  const { goalMarathonTime, week, preferences } = params;
  
  if (!goalMarathonTime) {
    throw new Error('Goal marathon time is required for long run generation');
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
  
  // Calculate training paces
  const paces = calculateTrainingPaces(marathonTime, preferences);
  
  // Get slow run duration and marathon pace miles for this week
  const slowRunDurationMinutes = getSlowRunDuration(week);
  const marathonPaceMiles = getMarathonPaceMiles(week);
  
  // Convert marathon pace miles to user's preferred units
  const marathonPaceDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS 
    ? marathonPaceMiles * 1.60934 // miles to km
    : marathonPaceMiles; // already in miles
  
  // Calculate easy run distance based on duration
  // Assume easy pace is capped at 9:00/mile (5:35/km)
  const easyPaceMinutes = Math.min(
    paces.easyPace.minutes + (paces.easyPace.seconds / 60),
    preferences.distanceUnit === DistanceUnit.KILOMETERS ? 5.58 : 9.0 // 9:00/mile = 5:35/km
  );
  
  const easyRunDistance = week === 14 ? 0 : (slowRunDurationMinutes / easyPaceMinutes);
  
  // Total distance for Week 14 should be full marathon distance
  const totalDistance = week === 14 
    ? (preferences.distanceUnit === DistanceUnit.KILOMETERS ? 42.195 : 26.2) // Full marathon distance
    : easyRunDistance + marathonPaceDistance;
  
  // Estimate total duration
  const marathonPaceMinutes = paces.marathonPace.minutes + (paces.marathonPace.seconds / 60);
  const estimatedDuration = week === 14 
    ? Math.round(totalDistance * marathonPaceMinutes) // Full marathon duration
    : slowRunDurationMinutes + Math.round(marathonPaceDistance * marathonPaceMinutes);
  
  // Format paces for display
  const easyPaceFormatted = formatPaceForUser(paces.easyPace, preferences);
  const marathonPaceFormatted = formatPaceForUser(paces.marathonPace, preferences);
  
  // Generate instructions
  const instructions = getLongRunInstructions(
    week,
    slowRunDurationMinutes,
    marathonPaceDistance,
    easyPaceFormatted,
    marathonPaceFormatted,
    preferences
  );
  
  // Get structure
  const structure = getLongRunStructure(
    week,
    easyRunDistance,
    marathonPaceDistance,
    preferences
  );
  
  return {
    name: week === 14 ? 'Marathon Race' : `Week ${week} Long Run`,
    description: week === 14 
      ? `Marathon Race - ${totalDistance} ${preferences.distanceUnit.toLowerCase()}`
      : `${slowRunDurationMinutes} mins easy + ${marathonPaceDistance.toFixed(1)} ${preferences.distanceUnit.toLowerCase()} at marathon pace`,
    type: week === 14 ? WorkoutType.MARATHON_RACE : WorkoutType.LONG_RUN,
    week,
    easyRunDistance,
    marathonPaceDistance,
    totalDistance,
    targetEasyPace: easyPaceFormatted,
    targetMarathonPace: marathonPaceFormatted,
    estimatedDuration,
    instructions,
    structure,
    // Add race day specific properties for Week 14
    ...(week === 14 && {
      isRaceDay: true,
      raceDetails: {
        startTime: '07:00', // Default start time
        location: 'TBD - Set in user preferences',
        instructions: 'Marathon Race Day - Execute your race plan and trust your training!'
      }
    })
  };
}

/**
 * Generate instructions for long runs
 */
function getLongRunInstructions(
  week: number,
  slowRunDurationMinutes: number,
  marathonPaceDistance: number,
  easyPace: string,
  marathonPace: string,
  preferences: TrainingPreferences
): string[] {
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const unitPlural = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'miles';
  
  if (week === 14) {
    // Race week - marathon pace only
    return [
      `Run ${marathonPaceDistance.toFixed(1)} ${unitPlural} at marathon pace: ${marathonPace}`,
      'This is your final tune-up before race day',
      'Focus on feeling smooth and controlled at marathon pace',
      'Keep the effort comfortable - save energy for race day',
      'Practice your race day fueling and hydration strategy'
    ];
  }
  
  return [
    `Run ${slowRunDurationMinutes} minutes at easy pace: ${easyPace} (max 9:00/mile)`,
    `Immediately transition to ${marathonPaceDistance.toFixed(1)} ${unitPlural} at marathon pace: ${marathonPace}`,
    'Easy pace should feel conversational - you should be able to talk',
    'Marathon pace should feel "comfortably hard" - sustainable for 26.2 miles',
    'No rest between easy and marathon pace portions - immediate transition',
    'Practice race day fueling during the marathon pace portion',
    'Focus on maintaining form as you transition from easy to marathon pace',
    'This workout simulates running marathon pace on tired legs',
    'If you struggle with marathon pace, your goal time may be too aggressive'
  ];
}

/**
 * Generates all long run workouts for a 14-week training plan
 */
export function generateAllLongRuns(params: Omit<LongRunParams, 'week'>): LongRunWorkout[] {
  const longRuns: LongRunWorkout[] = [];
  
  for (let week = 1; week <= 14; week++) {
    const longRun = generateLongRun({ ...params, week });
    longRuns.push(longRun);
  }
  
  return longRuns;
}

/**
 * Gets the recommended easy pace (capped at 9:00/mile)
 */
export function getRecommendedEasyPace(
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
  
  const paces = calculateTrainingPaces(marathonTime, preferences);
  
  // Cap easy pace at 9:00/mile (5:35/km)
  const maxEasyPaceMinutes = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 5.58 : 9.0;
  const easyPaceMinutes = paces.easyPace.minutes + (paces.easyPace.seconds / 60);
  
  if (easyPaceMinutes > maxEasyPaceMinutes) {
    const cappedPace = {
      minutes: Math.floor(maxEasyPaceMinutes),
      seconds: Math.round((maxEasyPaceMinutes % 1) * 60)
    };
    return formatPaceForUser(cappedPace, preferences);
  }
  
  return formatPaceForUser(paces.easyPace, preferences);
} 