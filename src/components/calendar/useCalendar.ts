import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CalendarState, 
  CalendarConfig, 
  CalendarEvent, 
  CalendarView, 
  DEFAULT_WORKOUT_COLORS,
  CalendarMonth 
} from './CalendarTypes';
import { 
  generateCalendarMonth, 
  addEventsToCalendarDays, 
  transformWorkoutsToEvents,
  getNavigationDates,
  formatMonthYear 
} from './CalendarUtils';
import { addMonths, subMonths } from 'date-fns';

interface UseCalendarProps {
  initialDate?: Date;
  initialView?: CalendarView;
  workouts?: any[]; // Will be typed properly when we integrate with training API
  marathonDate?: Date;
}

export function useCalendar({
  initialDate = new Date(),
  initialView = 'month',
  workouts = [],
  marathonDate,
}: UseCalendarProps = {}) {
  // Calendar configuration state
  const [config, setConfig] = useState<CalendarConfig>({
    view: initialView,
    currentDate: initialDate,
    selectedDate: undefined,
    showWeekends: true,
    highlightToday: true,
    workoutColors: DEFAULT_WORKOUT_COLORS,
  });

  // Calendar data state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Transform workouts to events when workouts change
  useEffect(() => {
    try {
      setLoading(true);
      const calendarEvents = transformWorkoutsToEvents(workouts, marathonDate);
      setEvents(calendarEvents);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  }, [workouts, marathonDate]);

  // Generate calendar month data
  const calendarMonth = useMemo<CalendarMonth>(() => {
    const baseMonth = generateCalendarMonth(config.currentDate, config.selectedDate);
    return addEventsToCalendarDays(baseMonth, events);
  }, [config.currentDate, config.selectedDate, events]);

  // Navigation functions
  const goToToday = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      currentDate: new Date(),
      selectedDate: new Date(),
    }));
  }, []);

  const goToPrevious = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      currentDate: subMonths(prev.currentDate, 1),
    }));
  }, []);

  const goToNext = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      currentDate: addMonths(prev.currentDate, 1),
    }));
  }, []);

  const goToDate = useCallback((date: Date) => {
    setConfig(prev => ({
      ...prev,
      currentDate: date,
      selectedDate: date,
    }));
  }, []);

  const setView = useCallback((view: CalendarView) => {
    setConfig(prev => ({
      ...prev,
      view,
    }));
  }, []);

  // Event handlers
  const onDateSelect = useCallback((date: Date) => {
    setConfig(prev => ({
      ...prev,
      selectedDate: date,
    }));
  }, []);

  const onEventClick = useCallback((event: CalendarEvent) => {
    // This will be implemented when we add event detail modals
    console.log('Event clicked:', event);
  }, []);

  const onEventComplete = useCallback((eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isCompleted: true }
        : event
    ));
  }, []);

  const onEventUncomplete = useCallback((eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isCompleted: false }
        : event
    ));
  }, []);

  // Computed values
  const navigationDates = useMemo(() => getNavigationDates(config.currentDate), [config.currentDate]);
  const monthYearDisplay = useMemo(() => formatMonthYear(config.currentDate), [config.currentDate]);

  // Calendar state
  const state: CalendarState = {
    config,
    events,
    loading,
    error,
  };

  return {
    // State
    state,
    calendarMonth,
    monthYearDisplay,
    navigationDates,
    
    // Navigation
    goToToday,
    goToPrevious,
    goToNext,
    goToDate,
    setView,
    
    // Event handlers
    onDateSelect,
    onEventClick,
    onEventComplete,
    onEventUncomplete,
    
    // Utilities
    setConfig,
    setEvents,
    setLoading,
    setError,
  };
} 