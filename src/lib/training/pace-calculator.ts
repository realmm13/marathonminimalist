import { PaceTime, PaceCalculationResult, TrainingPreferences, MarathonTime } from '../../types/training';
import { DistanceUnit, PaceFormat } from '../../generated/prisma';

/**
 * Converts a time string to PaceTime object
 * @param timeString Format: "MM:SS" or "HH:MM:SS"
 */
export function parseTimeString(timeString: string): PaceTime {
  const parts = timeString.split(':').map(Number);
  
  // Validate that all parts are valid numbers
  if (parts.some(part => isNaN(part))) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  
  if (parts.length === 2) {
    // MM:SS format
    return { minutes: parts[0]!, seconds: parts[1]! };
  } else if (parts.length === 3) {
    // HH:MM:SS format - convert to total minutes and seconds
    const totalMinutes = parts[0]! * 60 + parts[1]!;
    return { minutes: totalMinutes, seconds: parts[2]! };
  }
  
  throw new Error(`Invalid time format: ${timeString}`);
}

/**
 * Converts PaceTime to total seconds
 */
export function paceTimeToSeconds(pace: PaceTime): number {
  return pace.minutes * 60 + pace.seconds;
}

/**
 * Converts seconds to PaceTime
 */
export function secondsToPaceTime(seconds: number): PaceTime {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return { minutes, seconds: remainingSeconds };
}

/**
 * Formats PaceTime as string
 */
export function formatPaceTime(pace: PaceTime): string {
  const paddedSeconds = pace.seconds.toString().padStart(2, '0');
  return `${pace.minutes}:${paddedSeconds}`;
}

/**
 * Estimates marathon time from 5K time using Jack Daniels formula
 */
export function estimate5KToMarathonTime(fiveKTime: string): string {
  const fiveKPace = parseTimeString(fiveKTime);
  const fiveKPaceSeconds = paceTimeToSeconds(fiveKPace);
  
  // Jack Daniels formula: Marathon pace ≈ 5K pace + 75-90 seconds per km
  // We'll use 80 seconds as a middle ground
  const marathonPaceSeconds = fiveKPaceSeconds + 80;
  const marathonTotalSeconds = marathonPaceSeconds * 42.195;
  
  const hours = Math.floor(marathonTotalSeconds / 3600);
  const minutes = Math.floor((marathonTotalSeconds % 3600) / 60);
  const seconds = Math.round(marathonTotalSeconds % 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate training paces based on goal marathon time
 * Uses proven methodology from simplified marathon training approach
 */
export function calculateTrainingPaces(
  goalMarathonTime: MarathonTime,
  preferences: TrainingPreferences
): PaceCalculationResult {
  // Convert marathon time to pace per mile/km
  const marathonPace = marathonTimeToMarathonPace(goalMarathonTime);
  const marathonPaceSeconds = paceTimeToSeconds(marathonPace);
  
  // Tempo pace: 12 seconds faster than marathon pace (proven methodology)
  const tempoPaceSeconds = Math.max(marathonPaceSeconds - 12, 180); // minimum 3:00/mile
  
  // Interval pace: Convert marathon time using hour→minute, minute→second method
  const intervalPaceSeconds = calculateIntervalPaceFromMarathonTime(goalMarathonTime);
  
  // Easy pace: Conversational pace, no faster than 9:00/mile (540 seconds)
  const easyPaceSeconds = Math.max(marathonPaceSeconds + 60, 540); // at least 9:00/mile
  
  // Long run pace: Same as easy pace for the easy portion
  const longRunPaceSeconds = easyPaceSeconds;

  return {
    marathonPace,
    tempoPace: secondsToPaceTime(tempoPaceSeconds),
    intervalPace: secondsToPaceTime(intervalPaceSeconds),
    easyPace: secondsToPaceTime(easyPaceSeconds),
    longRunPace: secondsToPaceTime(longRunPaceSeconds),
    unit: preferences.distanceUnit
  };
}

/**
 * Convert marathon finish time to marathon pace per mile/km
 */
function marathonTimeToMarathonPace(marathonTime: MarathonTime): PaceTime {
  const totalSeconds = marathonTime.hours * 3600 + marathonTime.minutes * 60 + marathonTime.seconds;
  const marathonDistance = 26.2188; // Official marathon distance in miles
  const paceSecondsPerMile = totalSeconds / marathonDistance;
  
  return secondsToPaceTime(paceSecondsPerMile);
}

/**
 * Calculate interval pace using the hour→minute, minute→second conversion method
 * Example: 3 hours 15 minutes marathon → 3:15 per 800m/0.5 mile
 */
function calculateIntervalPaceFromMarathonTime(marathonTime: MarathonTime): number {
  // Convert marathon time to total minutes
  const totalMinutes = marathonTime.hours * 60 + marathonTime.minutes;
  
  // Convert to MM:SS format for intervals
  const intervalMinutes = Math.floor(totalMinutes / 60); // hours become minutes
  const intervalSeconds = totalMinutes % 60; // minutes become seconds
  
  // Convert to total seconds for consistency with other pace calculations
  return intervalMinutes * 60 + intervalSeconds;
}

/**
 * Converts pace between km and miles
 */
export function convertPace(pace: PaceTime, fromUnit: DistanceUnit, toUnit: DistanceUnit): PaceTime {
  if (fromUnit === toUnit) return pace;
  
  const paceSeconds = paceTimeToSeconds(pace);
  
  if (fromUnit === DistanceUnit.KILOMETERS && toUnit === DistanceUnit.MILES) {
    // Convert from min/km to min/mile (multiply by 1.609344)
    const convertedSeconds = paceSeconds * 1.609344;
    return secondsToPaceTime(convertedSeconds);
  } else {
    // Convert from min/mile to min/km (divide by 1.609344)
    const convertedSeconds = paceSeconds / 1.609344;
    return secondsToPaceTime(convertedSeconds);
  }
}

/**
 * Formats pace according to user preferences
 */
export function formatPaceForUser(pace: PaceTime, preferences: TrainingPreferences): string {
  const convertedPace = convertPace(
    pace,
    DistanceUnit.MILES, // Our internal format is miles (26.2 miles for marathon)
    preferences.distanceUnit
  );
  
  const formattedPace = formatPaceTime(convertedPace);
  const unit = preferences.distanceUnit === DistanceUnit.KILOMETERS ? 'km' : 'mi';
  
  return `${formattedPace}/${unit}`;
} 