import { 
  CalendarMonth, 
  CalendarWeek, 
  CalendarDay, 
  CalendarEvent, 
  WorkoutData 
} from './CalendarTypes';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

/**
 * Generate calendar month data with weeks and days
 */
export function generateCalendarMonth(date: Date, selectedDate?: Date): CalendarMonth {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Group days into weeks
  const weeks: CalendarWeek[] = [];
  let currentWeek: CalendarDay[] = [];
  
  days.forEach((day, index) => {
    const calendarDay: CalendarDay = {
      date: day,
      isCurrentMonth: day.getMonth() === month,
      isToday: isToday(day),
      isSelected: selectedDate ? isSameDay(day, selectedDate) : false,
      events: [], // Will be populated separately
    };
    
    currentWeek.push(calendarDay);
    
    // Start new week every 7 days
    if (currentWeek.length === 7) {
      weeks.push({
        weekNumber: Math.ceil((index + 1) / 7),
        days: currentWeek,
      });
      currentWeek = [];
    }
  });
  
  return {
    year,
    month,
    weeks,
  };
}

/**
 * Transform workout data from training API to calendar events
 */
export function transformWorkoutsToEvents(workouts: WorkoutData[], marathonDate?: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  // Add workout events
  workouts.forEach(workout => {
    const event: CalendarEvent = {
      id: workout.id,
      title: workout.name,
      date: workout.scheduledDate,
      type: 'workout',
      workoutType: workout.type,
      description: workout.description,
      distance: workout.distance,
      duration: workout.duration,
      pace: workout.pace,
      isCompleted: workout.isCompleted,
      isToday: isToday(workout.scheduledDate),
      isUpcoming: workout.scheduledDate > new Date(),
      isPast: workout.scheduledDate < new Date(),
    };
    events.push(event);
  });
  
  // Add marathon race event if date is provided
  if (marathonDate) {
    const raceEvent: CalendarEvent = {
      id: 'marathon-race',
      title: 'Marathon Race Day',
      date: marathonDate,
      type: 'race',
      workoutType: 'MARATHON_RACE',
      description: 'Marathon race day - 26.2 miles',
      distance: 26.2,
      isCompleted: false,
      isToday: isToday(marathonDate),
      isUpcoming: marathonDate > new Date(),
      isPast: marathonDate < new Date(),
    };
    events.push(raceEvent);
  }
  
  return events;
}

/**
 * Add events to calendar days
 */
export function addEventsToCalendarDays(
  calendarMonth: CalendarMonth, 
  events: CalendarEvent[]
): CalendarMonth {
  const updatedWeeks = calendarMonth.weeks.map(week => ({
    ...week,
    days: week.days.map(day => ({
      ...day,
      events: events.filter(event => isSameDay(event.date, day.date)),
    })),
  }));
  
  return {
    ...calendarMonth,
    weeks: updatedWeeks,
  };
}

/**
 * Get navigation dates for calendar
 */
export function getNavigationDates(currentDate: Date) {
  return {
    previous: subMonths(currentDate, 1),
    next: addMonths(currentDate, 1),
    today: new Date(),
  };
}

/**
 * Format month and year for display
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Format day of week
 */
export function formatDayOfWeek(date: Date): string {
  return format(date, 'EEE');
}

/**
 * Get day number
 */
export function getDayNumber(date: Date): number {
  return date.getDate();
}

/**
 * Check if date is in current month
 */
export function isCurrentMonth(date: Date, referenceDate: Date): boolean {
  return date.getMonth() === referenceDate.getMonth() && 
         date.getFullYear() === referenceDate.getFullYear();
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(event => isSameDay(event.date, date));
}

/**
 * Get workout type display name
 */
export function getWorkoutTypeDisplayName(workoutType: string): string {
  const displayNames: Record<string, string> = {
    TEMPO_RUN: 'Tempo Run',
    INTERVAL_800M: 'Intervals',
    LONG_RUN: 'Long Run',
    EASY_RUN: 'Easy Run',
    RECOVERY_RUN: 'Recovery',
    MARATHON_RACE: 'Marathon',
  };
  
  return displayNames[workoutType] || workoutType;
}

/**
 * Get short workout type name for compact display
 */
export function getWorkoutTypeShortName(workoutType: string): string {
  const shortNames: Record<string, string> = {
    TEMPO_RUN: 'Tempo',
    INTERVAL_800M: 'Intervals',
    LONG_RUN: 'Long',
    EASY_RUN: 'Easy',
    RECOVERY_RUN: 'Recovery',
    MARATHON_RACE: 'Race',
  };
  
  return shortNames[workoutType] || workoutType;
}

/**
 * Sort events by priority (race > workout > rest)
 */
export function sortEventsByPriority(events: CalendarEvent[]): CalendarEvent[] {
  const priorityOrder = { race: 3, workout: 2, rest: 1 };
  
  return [...events].sort((a, b) => {
    const aPriority = priorityOrder[a.type] || 0;
    const bPriority = priorityOrder[b.type] || 0;
    return bPriority - aPriority;
  });
} 