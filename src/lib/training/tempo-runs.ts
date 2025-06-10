import { ExperienceLevel, WorkoutType, DistanceUnit } from '../../generated/prisma';
import { TrainingPreferences, MarathonTime } from '@/types/training';
import { calculateTrainingPaces, formatPaceForUser } from './pace-calculator';

export interface TempoRunParams {
  goalMarathonTime: string;
  week: number;
  preferences: TrainingPreferences;
}

export interface TempoRunWorkout {
  name: string;
  description: string;
  type: WorkoutType;
  week: number;
  warmUpDistance: number;
  tempoDistance: number;
  coolDownDistance: number;
  totalDistance: number;
  targetPace: string;
  estimatedDuration: number;
  instructions: string[];
  structure: string;
}

/**
 * Get tempo run distance for a specific week
 * Fixed progression for all runners regardless of experience level
 */
function getTempoDistance(week: number): number {
  const tempoProgression: Record<number, number> = {
    1: 3,   // 3 miles @ MP
    2: 4,   // 4 miles @ MP
    3: 5,   // 5 miles @ MP
    4: 6,   // 6 miles @ MP
    5: 7,   // 7 miles @ MP
    6: 8,   // 8 miles @ MP
    7: 9,   // 9 miles @ MP
    8: 10,  // 10 miles @ MP
    9: 11,  // 11 miles @ MP
    10: 12, // 12 miles @ MP (PEAK)
    11: 10, // 10 miles @ MP
    12: 8,  // 8 miles @ MP
    13: 6,  // 6 miles @ MP
    14: 4   // 4 miles @ MP
  };

  const distance = tempoProgression[week];
  if (!distance) {
    throw new Error(`Invalid week: ${week}. Must be between 1 and 14.`);
  }

  return distance;
}

/**
 * Generate a single tempo run workout
 * Uses training pace that's 10-12 seconds faster than marathon pace (MP)
 * This builds in a cushion as recommended for marathon training
 */
export function generateTempoRun(params: TempoRunParams): TempoRunWorkout {
  const { goalMarathonTime, week, preferences } = params;
  
  if (!goalMarathonTime) {
    throw new Error('Goal marathon time is required for tempo run generation');
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
  
  // Get tempo distance for this week (in miles)
  const tempoDistanceMiles = getTempoDistance(week);
  
  // Convert to user's preferred units
  const tempoDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS 
    ? tempoDistanceMiles * 1.60934 // miles to km
    : tempoDistanceMiles; // already in miles
  
  // Warm-up and cool-down (separate from main tempo work)
  const warmUpDistance = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 1.6 : 1; // 1 mile
  const coolDownDistance = warmUpDistance; // Same as warm-up
  
  const totalDistance = warmUpDistance + tempoDistance + coolDownDistance;
  
  // Calculate training pace (10-12 seconds faster than marathon pace)
  // Using 11 seconds as the middle of the recommended 10-12 second range
  const marathonPaceSeconds = paces.marathonPace.minutes * 60 + paces.marathonPace.seconds;
  const trainingPaceSeconds = Math.max(marathonPaceSeconds - 11, 180); // minimum 3:00/mile
  const trainingPace = {
    minutes: Math.floor(trainingPaceSeconds / 60),
    seconds: trainingPaceSeconds % 60
  };
  
  // Estimate duration (training pace + easier warm-up/cool-down)
  const trainingPaceMinutes = trainingPace.minutes + (trainingPace.seconds / 60);
  const easyPaceMinutes = paces.easyPace.minutes + (paces.easyPace.seconds / 60);
  
  const estimatedDuration = Math.round(
    (warmUpDistance * easyPaceMinutes) + 
    (tempoDistance * trainingPaceMinutes) + 
    (coolDownDistance * easyPaceMinutes)
  );
  
  // Format training pace for display
  const trainingPaceFormatted = formatPaceForUser(trainingPace, preferences);
  
  // Generate instructions
  const instructions = getTempoRunInstructions(
    trainingPaceFormatted, 
    formatPaceForUser(paces.marathonPace, preferences),
    tempoDistance, 
    preferences
  );
  
  // Get structure with pace information
  const structure = getTempoRunStructure(
    warmUpDistance,
    tempoDistance,
    coolDownDistance,
    formatPaceForUser(paces.easyPace, preferences),
    trainingPaceFormatted,
    preferences
  );
  
  return {
    name: `Week ${week} Tempo Run`,
    description: `${tempoDistance.toFixed(1)} ${preferences.distanceUnit.toLowerCase()} at training pace (${trainingPaceFormatted})`,
    type: WorkoutType.TEMPO_RUN,
    week,
    warmUpDistance,
    tempoDistance,
    coolDownDistance,
    totalDistance,
    targetPace: trainingPaceFormatted,
    estimatedDuration,
    instructions,
    structure
  };
}

/**
 * Generate instructions for tempo runs
 */
function getTempoRunInstructions(
  trainingPace: string, 
  marathonPace: string,
  distance: number,
  preferences: TrainingPreferences
): string[] {
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const warmUpCoolDown = preferences.distanceUnit === DistanceUnit.KILOMETERS ? '1.6km' : '1 mile';
  
  return [
    `Warm up with ${warmUpCoolDown} easy jog`,
    `Run ${distance.toFixed(1)} ${unit} at training pace: ${trainingPace}`,
    `Cool down with ${warmUpCoolDown} easy jog`,
    'Training pace should feel "comfortably hard" - sustainable for the full marathon distance',
    `This pace is 10-12 seconds faster than your goal marathon pace (${marathonPace})`,
    'Building in this cushion helps ensure you can maintain pace on race day',
    'Focus on smooth, efficient running form at this effort level',
    'If you feel you\'re pushing too hard, you may need to adjust your marathon goal time'
  ];
}

/**
 * Generate structure description for tempo run
 */
function getTempoRunStructure(
  warmUpDistance: number,
  tempoDistance: number,
  coolDownDistance: number,
  easyPace: string,
  trainingPace: string,
  preferences: TrainingPreferences
): string {
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  const unitSingular = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mile';
  
  return `Warm-up (${warmUpDistance.toFixed(1)} ${warmUpDistance === 1 ? unitSingular : unit} at ${easyPace}) → Tempo segment (${tempoDistance.toFixed(1)} ${tempoDistance === 1 ? unitSingular : unit} at ${trainingPace}) → Cool-down (${coolDownDistance.toFixed(1)} ${coolDownDistance === 1 ? unitSingular : unit} at ${easyPace})`;
}

/**
 * Generates all tempo run workouts for a 14-week training plan
 */
export function generateAllTempoRuns(params: Omit<TempoRunParams, 'week'>): TempoRunWorkout[] {
  const tempoRuns: TempoRunWorkout[] = [];
  
  for (let week = 1; week <= 14; week++) {
    const tempoRun = generateTempoRun({ ...params, week });
    tempoRuns.push(tempoRun);
  }
  
  return tempoRuns;
}

/**
 * Gets the recommended marathon pace
 */
export function getRecommendedMarathonPace(
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
  return formatPaceForUser(paces.marathonPace, preferences);
} 