import { WorkoutType } from '@/generated/prisma';

// Calendar event types
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'workout' | 'race' | 'rest';
  workoutType?: WorkoutType;
  description?: string;
  distance?: number;
  duration?: number;
  pace?: string;
  isCompleted?: boolean;
  isToday?: boolean;
  isUpcoming?: boolean;
  isPast?: boolean;
}

// Workout data from training API
export interface WorkoutData {
  id: string;
  name: string;
  description: string;
  type: WorkoutType;
  week: number;
  day: number;
  scheduledDate: Date;
  distance?: number;
  duration?: number;
  pace?: string;
  intervals?: any;
  isCompleted: boolean;
  completionData?: {
    id: string;
    completedAt: string;
    notes?: string;
    actualDistance?: number;
    actualDuration?: number;
    actualPace?: string;
  } | null;
}

// Calendar view modes
export type CalendarView = 'month' | 'week';

// Calendar configuration
export interface CalendarConfig {
  view: CalendarView;
  currentDate: Date;
  selectedDate?: Date;
  showWeekends: boolean;
  highlightToday: boolean;
  workoutColors: Record<WorkoutType, string>;
}

// Calendar navigation
export interface CalendarNavigation {
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
}

// Calendar event handlers
export interface CalendarEventHandlers {
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventComplete: (eventId: string) => void;
  onEventUncomplete: (eventId: string) => void;
}

// Calendar state
export interface CalendarState {
  config: CalendarConfig;
  events: CalendarEvent[];
  loading: boolean;
  error?: string;
}

// Default workout colors inspired by Subwatch design - simplified to 3 types
export const DEFAULT_WORKOUT_COLORS: Record<WorkoutType, string> = {
  TEMPO_RUN: '#F59E0B', // Amber
  INTERVAL_800M: '#EF4444', // Red
  LONG_RUN: '#10B981', // Green - Combined with Easy Run
  EASY_RUN: '#10B981', // Green - Same as Long Run
  RECOVERY_RUN: '#10B981', // Green - Same as Long Run
  MARATHON_RACE: '#8B5CF6', // Purple
};

// Simplified workout type mapping for display
export const SIMPLIFIED_WORKOUT_TYPES = {
  RUN: ['EASY_RUN', 'LONG_RUN', 'RECOVERY_RUN'],
  TEMPO: ['TEMPO_RUN'],
  INTERVALS: ['INTERVAL_800M'],
  RACE: ['MARATHON_RACE']
} as const;

// Display names for simplified types
export const SIMPLIFIED_WORKOUT_DISPLAY_NAMES = {
  RUN: 'Long Run',
  TEMPO: 'Tempo',
  INTERVALS: 'Intervals',
  RACE: 'Race Day'
} as const;

// Calendar month data
export interface CalendarMonth {
  year: number;
  month: number; // 0-based (0 = January)
  weeks: CalendarWeek[];
}

export interface CalendarWeek {
  weekNumber: number;
  days: CalendarDay[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
} 