import { addWeeks, differenceInWeeks, isAfter, isBefore } from 'date-fns';
import { WorkoutType } from '../../generated/prisma';
import { 
  TrainingPreferences, 
  TempoRunWorkout, 
  IntervalWorkout, 
  LongRunWorkout,
  TempoRunParams,
  IntervalParams,
  LongRunParams
} from '@/types/training';
import { generateTempoRun } from './tempo-runs';
import { generateIntervalWorkout } from './intervals';
import { generateLongRun } from './long-runs';

export interface ShortTimelineConfig {
  availableWeeks: number;
  startDate: Date;
  raceDate: Date;
  isViable: boolean;
  adaptationStrategy: 'compress' | 'prioritize' | 'minimal' | 'defer';
  recommendedAction: string;
}

export interface AdaptedWorkoutPlan {
  weeks: number;
  workouts: (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Assess if the timeline between start and race date is viable for marathon training
 */
export function assessTimelineViability(
  startDate: Date,
  raceDate: Date
): ShortTimelineConfig {
  const availableWeeks = differenceInWeeks(raceDate, startDate);
  
  let isViable = true;
  let adaptationStrategy: ShortTimelineConfig['adaptationStrategy'] = 'compress';
  let recommendedAction = '';
  
  if (availableWeeks < 4) {
    isViable = false;
    adaptationStrategy = 'defer';
    recommendedAction = 'Consider deferring to a later race. 4 weeks is the absolute minimum for any meaningful training adaptation.';
  } else if (availableWeeks < 6) {
    adaptationStrategy = 'minimal';
    recommendedAction = 'Focus only on maintaining current fitness and race strategy practice. Avoid increasing training load.';
  } else if (availableWeeks < 10) {
    adaptationStrategy = 'prioritize';
    recommendedAction = 'Prioritize long runs and tempo work. Skip some interval sessions if needed.';
  } else if (availableWeeks < 14) {
    adaptationStrategy = 'compress';
    recommendedAction = 'Compress the standard 14-week plan by skipping some build-up weeks.';
  }
  
  return {
    availableWeeks,
    startDate,
    raceDate,
    isViable,
    adaptationStrategy,
    recommendedAction
  };
}

/**
 * Get the priority order of workout types for short timelines
 */
function getWorkoutPriority(): WorkoutType[] {
  return [
    WorkoutType.LONG_RUN,      // Most critical for marathon endurance
    WorkoutType.TEMPO_RUN,     // Marathon pace practice
    WorkoutType.INTERVAL_800M  // Speed/VO2 max development
  ];
}

/**
 * Generate a compressed week mapping for shorter timelines
 */
function generateCompressedWeekMapping(availableWeeks: number): number[] {
  const fullPlan = Array.from({ length: 14 }, (_, i) => i + 1);
  
  if (availableWeeks >= 12) {
    // Skip weeks 2 and 4 (early build-up weeks)
    return fullPlan.filter(week => week !== 2 && week !== 4);
  } else if (availableWeeks >= 10) {
    // Skip weeks 1, 2, 4, 6 (more aggressive compression)
    return fullPlan.filter(week => ![1, 2, 4, 6].includes(week));
  } else if (availableWeeks >= 8) {
    // Keep only key weeks: 3, 5, 7, 8, 9, 10, 12, 14
    return [3, 5, 7, 8, 9, 10, 12, 14];
  } else if (availableWeeks >= 6) {
    // Minimal plan: 5, 7, 9, 10, 12, 14
    return [5, 7, 9, 10, 12, 14];
  } else {
    // Emergency plan: 7, 9, 12, 14
    return [7, 9, 12, 14];
  }
}

/**
 * Generate workouts for prioritized strategy (focus on most important workout types)
 */
function generatePrioritizedWorkouts(
  availableWeeks: number,
  goalMarathonTime: string,
  preferences: TrainingPreferences
): (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[] {
  const workouts: (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[] = [];
  const weekMapping = generateCompressedWeekMapping(availableWeeks);
  const priority = getWorkoutPriority();
  
  // Calculate how many workouts we can fit per week
  const workoutsPerWeek = Math.min(3, Math.floor(availableWeeks * 3 / weekMapping.length));
  
  for (let i = 0; i < weekMapping.length; i++) {
    const originalWeek = weekMapping[i]!;
    
    // Always include long run (highest priority)
    const longRunParams = {
      goalMarathonTime,
      week: originalWeek,
      preferences
    };
    workouts.push(generateLongRun(longRunParams));
    
    // Add tempo run if we have space
    if (workoutsPerWeek >= 2) {
      const tempoParams = {
        goalMarathonTime,
        week: originalWeek,
        preferences
      };
      workouts.push(generateTempoRun(tempoParams));
    }
    
    // Add intervals if we have space
    if (workoutsPerWeek >= 3) {
      const intervalParams = {
        goalMarathonTime,
        week: originalWeek,
        preferences
      };
      workouts.push(generateIntervalWorkout(intervalParams));
    }
  }
  
  return workouts;
}

/**
 * Generate workouts for compressed strategy (fit full plan into shorter timeline)
 */
function generateCompressedWorkouts(
  availableWeeks: number,
  goalMarathonTime: string,
  preferences: TrainingPreferences
): (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[] {
  const workouts: (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[] = [];
  const weekMapping = generateCompressedWeekMapping(availableWeeks);
  
  for (const originalWeek of weekMapping) {
    // Generate all three workout types for each week
    const tempoParams = {
      goalMarathonTime,
      week: originalWeek,
      preferences
    };
    workouts.push(generateTempoRun(tempoParams));
    
    const intervalParams = {
      goalMarathonTime,
      week: originalWeek,
      preferences
    };
    workouts.push(generateIntervalWorkout(intervalParams));
    
    const longRunParams = {
      goalMarathonTime,
      week: originalWeek,
      preferences
    };
    workouts.push(generateLongRun(longRunParams));
  }
  
  return workouts;
}

/**
 * Generate workouts for minimal strategy (maintenance only)
 */
function generateMinimalWorkouts(
  availableWeeks: number,
  goalMarathonTime: string,
  preferences: TrainingPreferences
): (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[] {
  const workouts: (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[] = [];
  
  // For minimal strategy, focus on maintaining fitness with easier weeks
  // Use weeks 7, 9, 12, 14 (moderate intensity, includes taper)
  const conservativeWeeks = [7, 9, 12, 14];
  const selectedWeeks = conservativeWeeks.slice(0, availableWeeks);
  
  for (const week of selectedWeeks) {
    // Only long runs for minimal strategy
    const longRunParams = {
      goalMarathonTime,
      week,
      preferences
    };
    workouts.push(generateLongRun(longRunParams));
  }
  
  return workouts;
}

/**
 * Generate warnings and recommendations for short timeline plans
 */
function generateWarningsAndRecommendations(
  config: ShortTimelineConfig,
  workoutCount: number
): { warnings: string[]; recommendations: string[] } {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (config.availableWeeks < 6) {
    warnings.push('Extremely short timeline - injury risk is elevated');
    warnings.push('Limited time for fitness adaptations');
    recommendations.push('Consider a shorter race distance (half marathon or 10K)');
    recommendations.push('Focus on race strategy and pacing practice');
  } else if (config.availableWeeks < 10) {
    warnings.push('Compressed timeline may limit fitness gains');
    warnings.push('Higher injury risk due to accelerated training');
    recommendations.push('Prioritize consistency over intensity');
    recommendations.push('Consider adjusting goal time to be more conservative');
  } else if (config.availableWeeks < 14) {
    warnings.push('Shortened build-up phase');
    recommendations.push('Focus on quality over quantity');
    recommendations.push('Ensure adequate recovery between hard sessions');
  }
  
  if (workoutCount < 20) {
    warnings.push('Limited number of key workouts for marathon preparation');
  }
  
  recommendations.push('Prioritize sleep and nutrition for faster recovery');
  recommendations.push('Consider working with a coach for personalized adjustments');
  
  return { warnings, recommendations };
}

/**
 * Main function to generate a training plan for short timelines
 */
export function generateShortTimelinePlan(
  startDate: Date,
  raceDate: Date,
  goalMarathonTime: string,
  preferences: TrainingPreferences
): AdaptedWorkoutPlan {
  const config = assessTimelineViability(startDate, raceDate);
  
  if (!config.isViable) {
    return {
      weeks: config.availableWeeks,
      workouts: [],
      warnings: ['Timeline too short for safe marathon training'],
      recommendations: [config.recommendedAction]
    };
  }
  
  let workouts: (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[] = [];
  
  switch (config.adaptationStrategy) {
    case 'compress':
      workouts = generateCompressedWorkouts(config.availableWeeks, goalMarathonTime, preferences);
      break;
    case 'prioritize':
      workouts = generatePrioritizedWorkouts(config.availableWeeks, goalMarathonTime, preferences);
      break;
    case 'minimal':
      workouts = generateMinimalWorkouts(config.availableWeeks, goalMarathonTime, preferences);
      break;
    default:
      throw new Error(`Unsupported adaptation strategy: ${config.adaptationStrategy}`);
  }
  
  const { warnings, recommendations } = generateWarningsAndRecommendations(config, workouts.length);
  
  return {
    weeks: config.availableWeeks,
    workouts,
    warnings,
    recommendations
  };
}

/**
 * Check if a given timeline requires short timeline handling
 */
export function requiresShortTimelineHandling(startDate: Date, raceDate: Date): boolean {
  const availableWeeks = differenceInWeeks(raceDate, startDate);
  return availableWeeks < 14;
}

/**
 * Get recommended minimum timeline for marathon training
 */
export function getRecommendedMinimumTimeline(): number {
  return 14; // weeks
}

/**
 * Get absolute minimum viable timeline for marathon training
 */
export function getAbsoluteMinimumTimeline(): number {
  return 4; // weeks
} 