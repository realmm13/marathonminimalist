import { describe, test, expect } from 'vitest';
import { calculateStartDateFromRaceDate, getTrainingWeekStart } from '../date-utils';
import { addWeeks, format, subWeeks } from 'date-fns';

describe('Date Utils', () => {
  describe('calculateStartDateFromRaceDate', () => {
    test('should calculate correct start date for Saturday race with Mon/Wed/Sat schedule', () => {
      // Race on Saturday, August 30, 2025
      const raceDate = new Date(2025, 7, 30); // Saturday (month is 0-indexed)
      const workoutDays = [1, 3, 6]; // Monday, Wednesday, Saturday
      
      const startDate = calculateStartDateFromRaceDate(raceDate, workoutDays);
      
      console.log('Race date:', format(raceDate, 'yyyy-MM-dd (EEEE)'));
      console.log('Final workout date should be:', format(raceDate, 'yyyy-MM-dd (EEEE)'));
      console.log('Week 14 start should be:', format(getTrainingWeekStart(raceDate), 'yyyy-MM-dd (EEEE)'));
      console.log('Calculated start date:', format(startDate, 'yyyy-MM-dd (EEEE)'));
      
      // If the race is on Saturday (workout day), the final workout is on the race date
      // Week 14 starts on Monday, August 25, 2025
      // Week 1 should start 13 weeks earlier: Monday, May 26, 2025
      const week14Start = getTrainingWeekStart(raceDate); // Monday, August 25, 2025
      const expectedStartDate = subWeeks(week14Start, 13); // Monday, May 26, 2025
      
      console.log('Expected start date:', format(expectedStartDate, 'yyyy-MM-dd (EEEE)'));
      
      expect(format(startDate, 'yyyy-MM-dd')).toBe(format(expectedStartDate, 'yyyy-MM-dd'));
    });

    test('should calculate correct start date for Sunday race with Tue/Thu/Sun schedule', () => {
      // Race on Sunday, August 31, 2025
      const raceDate = new Date(2025, 7, 31); // Sunday (month is 0-indexed)
      const workoutDays = [2, 4, 7]; // Tuesday, Thursday, Sunday
      
      const startDate = calculateStartDateFromRaceDate(raceDate, workoutDays);
      
      // If the race is on Sunday (workout day), the final workout is on the race date
      // Week 14 starts on Monday, August 25, 2025
      // Week 1 should start 13 weeks earlier: Monday, May 26, 2025
      const week14Start = getTrainingWeekStart(raceDate); // Monday, August 25, 2025
      const expectedStartDate = subWeeks(week14Start, 13); // Monday, May 26, 2025
      
      expect(format(startDate, 'yyyy-MM-dd')).toBe(format(expectedStartDate, 'yyyy-MM-dd'));
    });

    test('should handle race on Wednesday with Mon/Wed/Fri schedule', () => {
      // Race on Wednesday, August 27, 2025
      const raceDate = new Date(2025, 7, 27); // Wednesday (month is 0-indexed)
      const workoutDays = [1, 3, 5]; // Monday, Wednesday, Friday
      
      const startDate = calculateStartDateFromRaceDate(raceDate, workoutDays);
      
      // If the race is on Wednesday (workout day), the final workout is on the race date
      // Week 14 starts on Monday, August 25, 2025
      // Week 1 should start 13 weeks earlier: Monday, May 26, 2025
      const week14Start = getTrainingWeekStart(raceDate); // Monday, August 25, 2025
      const expectedStartDate = subWeeks(week14Start, 13); // Monday, May 26, 2025
      
      expect(format(startDate, 'yyyy-MM-dd')).toBe(format(expectedStartDate, 'yyyy-MM-dd'));
    });

    test('should handle race on Tuesday with Mon/Wed/Sat schedule (should use previous Saturday)', () => {
      // Race on Tuesday, August 26, 2025
      const raceDate = new Date(2025, 7, 26); // Tuesday (month is 0-indexed)
      const workoutDays = [1, 3, 6]; // Monday, Wednesday, Saturday
      
      const startDate = calculateStartDateFromRaceDate(raceDate, workoutDays);
      
      // The race is on Tuesday (not a workout day)
      // The most recent workout day before Tuesday is Monday (August 25)
      // Week 14 starts on Monday, August 25, 2025
      // Week 1 should start 13 weeks earlier: Monday, May 26, 2025
      const finalWorkoutDate = new Date(2025, 7, 25); // Monday (month is 0-indexed)
      const week14Start = getTrainingWeekStart(finalWorkoutDate); // Monday, August 25, 2025
      const expectedStartDate = subWeeks(week14Start, 13); // Monday, May 26, 2025
      
      expect(format(startDate, 'yyyy-MM-dd')).toBe(format(expectedStartDate, 'yyyy-MM-dd'));
    });
  });

  describe('getTrainingWeekStart', () => {
    test('should return Monday for any day of the week', () => {
      // Test various days
      const wednesday = new Date(2025, 7, 27); // Wednesday (month is 0-indexed)
      const saturday = new Date(2025, 7, 30); // Saturday (month is 0-indexed)
      const sunday = new Date(2025, 7, 31); // Sunday (month is 0-indexed)
      
      expect(format(getTrainingWeekStart(wednesday), 'yyyy-MM-dd')).toBe('2025-08-25'); // Monday
      expect(format(getTrainingWeekStart(saturday), 'yyyy-MM-dd')).toBe('2025-08-25'); // Monday
      expect(format(getTrainingWeekStart(sunday), 'yyyy-MM-dd')).toBe('2025-08-25'); // Monday
    });
  });
}); 