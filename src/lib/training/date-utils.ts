import { addWeeks, addDays, format, startOfWeek, isSameDay, subWeeks, subDays } from 'date-fns';

/**
 * Date utilities for training plan scheduling
 */

export interface WorkoutSchedule {
  date: Date;
  week: number;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  workoutType: 'tempo' | 'interval' | 'long' | 'easy' | 'rest';
}

/**
 * Calculate the end date of a 14-week training plan
 */
export function calculatePlanEndDate(startDate: Date): Date {
  return addWeeks(startDate, 14);
}

/**
 * Calculate the proper start date by working backward from race date
 * to ensure the Week 14 marathon race falls exactly on the user's selected race date
 * @param raceDate - The target race date (this will be the exact date of the Week 14 marathon)
 * @param workoutDays - Array of preferred workout days (1=Monday, 7=Sunday)
 * @returns The calculated start date for the training plan
 */
export function calculateStartDateFromRaceDate(
  raceDate: Date,
  workoutDays: number[]
): Date {
  // For marathon training, the race date is sacred - Week 14 marathon must fall on this exact date
  // We'll work backward from this date to calculate the start date
  
  // Get the start of the week containing the race date (this will be week 14)
  const week14Start = getTrainingWeekStart(raceDate);
  
  // Go back 13 weeks to get the start of week 1
  const planStartDate = subWeeks(week14Start, 13);
  
  return planStartDate;
}

/**
 * Get the start of the training week (Monday)
 * Training weeks always start on Monday regardless of user's preferred workout days
 */
export function getTrainingWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Convert day number to day name for display
 */
export function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}

/**
 * Get the next occurrence of a specific day of the week from a given date
 * @param fromDate - Starting date
 * @param targetDay - Target day of week (1=Monday, 7=Sunday)
 * @returns The next occurrence of that day
 */
export function getNextDayOfWeek(fromDate: Date, targetDay: number): Date {
  const currentDay = fromDate.getDay();
  const adjustedCurrentDay = currentDay === 0 ? 7 : currentDay; // Convert Sunday from 0 to 7
  const adjustedTargetDay = targetDay === 0 ? 7 : targetDay;
  
  let daysToAdd = adjustedTargetDay - adjustedCurrentDay;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Move to next week if the day has passed
  }
  
  return addDays(fromDate, daysToAdd);
}

/**
 * Generate all workout dates for a specific week based on user preferences
 * @param weekStartDate - Monday of the training week
 * @param workoutDays - Array of preferred workout days (1=Monday, 7=Sunday)
 * @param week - Week number (1-14)
 * @returns Array of workout schedules for that week
 */
export function generateWeeklyWorkoutDates(
  weekStartDate: Date,
  workoutDays: number[],
  week: number
): WorkoutSchedule[] {
  const workoutSchedules: WorkoutSchedule[] = [];
  
  // Sort workout days to ensure consistent ordering
  const sortedWorkoutDays = [...workoutDays].sort();
  
  for (const dayOfWeek of sortedWorkoutDays) {
    // Calculate the actual date for this workout day
    const daysFromMonday = dayOfWeek === 7 ? 6 : dayOfWeek - 1; // Convert to 0-6 (Mon-Sun)
    const workoutDate = addDays(weekStartDate, daysFromMonday);
    
    workoutSchedules.push({
      date: workoutDate,
      week,
      dayOfWeek,
      workoutType: 'easy' // Default, will be assigned specific types later
    });
  }
  
  return workoutSchedules;
}

/**
 * Generate all workout dates for the entire 14-week training plan
 * @param startDate - Plan start date
 * @param workoutDays - Array of preferred workout days
 * @param raceDate - Optional race date for Week 14 marathon (overrides workout day preference)
 * @returns Array of all workout schedules for the plan
 */
export function generateFullPlanSchedule(
  startDate: Date,
  workoutDays: number[],
  raceDate?: Date
): WorkoutSchedule[] {
  const allWorkouts: WorkoutSchedule[] = [];
  
  // Start from the Monday of the start week
  let currentWeekStart = getTrainingWeekStart(startDate);
  
  for (let week = 1; week <= 14; week++) {
    if (week === 14 && raceDate) {
      // Special handling for Week 14 - marathon race must be on the exact race date
      const weeklyWorkouts = generateWeek14WorkoutDates(currentWeekStart, workoutDays, raceDate);
      allWorkouts.push(...weeklyWorkouts);
    } else {
      // Normal week - use user's preferred workout days
      const weeklyWorkouts = generateWeeklyWorkoutDates(currentWeekStart, workoutDays, week);
      allWorkouts.push(...weeklyWorkouts);
    }
    
    // Move to next week
    currentWeekStart = addWeeks(currentWeekStart, 1);
  }
  
  return allWorkouts;
}

/**
 * Generate workout dates for Week 14 with special handling for race date
 * @param weekStartDate - Monday of Week 14
 * @param workoutDays - Array of preferred workout days
 * @param raceDate - The exact date of the marathon race
 * @returns Array of workout schedules for Week 14
 */
export function generateWeek14WorkoutDates(
  weekStartDate: Date,
  workoutDays: number[],
  raceDate: Date
): WorkoutSchedule[] {
  const workoutSchedules: WorkoutSchedule[] = [];
  
  // Get the day of week for the race date
  const raceDayOfWeek = raceDate.getDay();
  const adjustedRaceDayOfWeek = raceDayOfWeek === 0 ? 7 : raceDayOfWeek; // Convert Sunday from 0 to 7
  
  // Sort workout days to ensure consistent ordering
  const sortedWorkoutDays = [...workoutDays].sort();
  
  // Add workouts for the user's preferred days, but replace the last one with the race date
  for (let i = 0; i < sortedWorkoutDays.length; i++) {
    const dayOfWeek = sortedWorkoutDays[i]!;
    
    if (i === sortedWorkoutDays.length - 1) {
      // This is the last workout of the week - use the race date instead
      workoutSchedules.push({
        date: raceDate,
        week: 14,
        dayOfWeek: adjustedRaceDayOfWeek,
        workoutType: 'long' // This will be the marathon race
      });
    } else {
      // Regular workout day
      const daysFromMonday = dayOfWeek === 7 ? 6 : dayOfWeek - 1; // Convert to 0-6 (Mon-Sun)
      const workoutDate = addDays(weekStartDate, daysFromMonday);
      
      // Only add this workout if it's before the race date
      if (workoutDate < raceDate) {
        workoutSchedules.push({
          date: workoutDate,
          week: 14,
          dayOfWeek,
          workoutType: 'easy' // Default, will be assigned specific types later
        });
      }
    }
  }
  
  return workoutSchedules;
}

/**
 * Assign workout types to scheduled dates based on training plan structure
 * Typical pattern: 3 workouts per week = Tempo (Tue), Intervals (Thu), Long Run (Sat)
 * @param schedules - Array of workout schedules
 * @returns Updated schedules with workout types assigned
 */
export function assignWorkoutTypes(schedules: WorkoutSchedule[]): WorkoutSchedule[] {
  return schedules.map((schedule, index) => {
    const weekWorkouts = schedules.filter(s => s.week === schedule.week);
    const workoutIndexInWeek = weekWorkouts.findIndex(w => isSameDay(w.date, schedule.date));
    
    // Assign workout types based on position in week
    if (weekWorkouts.length === 3) {
      // Standard 3-workout week: Tempo, Intervals, Long Run
      switch (workoutIndexInWeek) {
        case 0:
          return { ...schedule, workoutType: 'tempo' as const };
        case 1:
          return { ...schedule, workoutType: 'interval' as const };
        case 2:
          return { ...schedule, workoutType: 'long' as const };
        default:
          return { ...schedule, workoutType: 'easy' as const };
      }
    } else if (weekWorkouts.length === 4) {
      // 4-workout week: Easy, Tempo, Intervals, Long Run
      switch (workoutIndexInWeek) {
        case 0:
          return { ...schedule, workoutType: 'easy' as const };
        case 1:
          return { ...schedule, workoutType: 'tempo' as const };
        case 2:
          return { ...schedule, workoutType: 'interval' as const };
        case 3:
          return { ...schedule, workoutType: 'long' as const };
        default:
          return { ...schedule, workoutType: 'easy' as const };
      }
    } else {
      // For other configurations, distribute key workouts
      if (workoutIndexInWeek === weekWorkouts.length - 1) {
        return { ...schedule, workoutType: 'long' as const }; // Long run is always last
      } else if (workoutIndexInWeek === 0) {
        return { ...schedule, workoutType: 'tempo' as const };
      } else if (workoutIndexInWeek === 1) {
        return { ...schedule, workoutType: 'interval' as const };
      } else {
        return { ...schedule, workoutType: 'easy' as const };
      }
    }
  });
}

/**
 * Format a date for display in the training plan
 */
export function formatWorkoutDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

/**
 * Format a date for database storage (ISO string)
 */
export function formatDateForDB(date: Date): string {
  return date.toISOString();
}

/**
 * Check if a date falls within the training plan period
 */
export function isDateInPlan(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
} 