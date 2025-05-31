import { WorkoutType } from '@/generated/prisma';
import { addDays, differenceInDays, isSameDay } from 'date-fns';

export interface WorkoutAssignmentPreferences {
  // Preferred days for specific workout types (1=Monday, 7=Sunday)
  preferredTempoDay?: number;
  preferredIntervalDay?: number;
  preferredLongRunDay?: number;
  
  // Minimum rest days between high-intensity workouts
  minRestBetweenHardWorkouts?: number;
  
  // Preferred rest days (1=Monday, 7=Sunday)
  preferredRestDays?: number[];
  
  // Whether to prioritize weekend long runs
  preferWeekendLongRuns?: boolean;
  
  // Whether to avoid back-to-back hard workouts
  avoidBackToBackHard?: boolean;
  
  // Whether to enforce preferred rest days strictly
  enforceRestDays?: boolean;
}

export interface WorkoutAssignment {
  dayOfWeek: number; // 1=Monday, 7=Sunday
  workoutType: WorkoutType;
  priority: number; // 1=highest priority, 3=lowest
  isOptimal: boolean; // Whether this assignment follows best practices
  conflicts: string[]; // List of potential issues with this assignment
}

export interface WeeklyAssignment {
  week: number;
  assignments: WorkoutAssignment[];
  totalWorkouts: number;
  restDays: number[];
  qualityScore: number; // 0-100, how well this week follows best practices
  suggestions: string[]; // Suggestions for improvement
}

export class WorkoutAssignmentEngine {
  private preferences: WorkoutAssignmentPreferences;

  constructor(preferences: WorkoutAssignmentPreferences = {}) {
    this.preferences = {
      minRestBetweenHardWorkouts: 1,
      preferWeekendLongRuns: true,
      avoidBackToBackHard: true,
      ...preferences
    };
  }

  /**
   * Assign workout types to selected workout days for a single week
   */
  public assignWorkoutsToWeek(
    workoutDays: number[], 
    week: number,
    customPreferences?: Partial<WorkoutAssignmentPreferences>
  ): WeeklyAssignment {
    const prefs = { ...this.preferences, ...customPreferences };
    const sortedDays = [...workoutDays].sort();
    const assignments: WorkoutAssignment[] = [];
    const conflicts: string[] = [];
    const suggestions: string[] = [];

    if (sortedDays.length === 0) {
      return {
        week,
        assignments: [],
        totalWorkouts: 0,
        restDays: [1, 2, 3, 4, 5, 6, 7],
        qualityScore: 0,
        suggestions: ['Add at least 3 workout days for effective training']
      };
    }

    // Assign workout types based on number of workout days
    if (sortedDays.length === 3) {
      assignments.push(...this.assignThreeWorkoutWeek(sortedDays, week, prefs));
    } else if (sortedDays.length === 4) {
      assignments.push(...this.assignFourWorkoutWeek(sortedDays, week, prefs));
    } else if (sortedDays.length === 2) {
      assignments.push(...this.assignTwoWorkoutWeek(sortedDays, week, prefs));
    } else {
      // 5+ workouts - advanced schedule
      assignments.push(...this.assignAdvancedWeek(sortedDays, week, prefs));
    }

    // Calculate rest days
    const restDays = [1, 2, 3, 4, 5, 6, 7].filter(day => !sortedDays.includes(day));

    // Analyze quality and generate suggestions
    const qualityAnalysis = this.analyzeWeekQuality(assignments, restDays, prefs);

    return {
      week,
      assignments,
      totalWorkouts: sortedDays.length,
      restDays,
      qualityScore: qualityAnalysis.score,
      suggestions: qualityAnalysis.suggestions
    };
  }

  /**
   * Assign workouts for a 3-workout week (most common)
   */
  private assignThreeWorkoutWeek(
    workoutDays: number[], 
    week: number, 
    prefs: WorkoutAssignmentPreferences
  ): WorkoutAssignment[] {
    const [day1, day2, day3] = workoutDays;
    const assignments: WorkoutAssignment[] = [];

    // Default pattern: Tempo, Intervals, Long Run
    // But adjust based on preferences and day spacing

    // Long run assignment (highest priority)
    const longRunDay = this.selectLongRunDay(workoutDays, prefs);
    assignments.push({
      dayOfWeek: longRunDay,
      workoutType: week === 14 ? WorkoutType.MARATHON_RACE : WorkoutType.LONG_RUN,
      priority: 1,
      isOptimal: this.isOptimalLongRunDay(longRunDay, prefs),
      conflicts: this.checkLongRunConflicts(longRunDay, workoutDays, prefs)
    });

    // Remaining days for tempo and intervals
    const remainingDays = workoutDays.filter(day => day !== longRunDay);
    const [tempoDay, intervalDay] = this.assignTempoAndIntervals(remainingDays, prefs);

    assignments.push({
      dayOfWeek: tempoDay,
      workoutType: WorkoutType.TEMPO_RUN,
      priority: 2,
      isOptimal: this.isOptimalTempoDay(tempoDay, prefs),
      conflicts: this.checkTempoConflicts(tempoDay, workoutDays, prefs)
    });

    assignments.push({
      dayOfWeek: intervalDay,
      workoutType: WorkoutType.INTERVAL_800M,
      priority: 2,
      isOptimal: this.isOptimalIntervalDay(intervalDay, prefs),
      conflicts: this.checkIntervalConflicts(intervalDay, workoutDays, prefs)
    });

    return assignments.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  /**
   * Assign workouts for a 4-workout week
   */
  private assignFourWorkoutWeek(
    workoutDays: number[], 
    week: number, 
    prefs: WorkoutAssignmentPreferences
  ): WorkoutAssignment[] {
    const assignments: WorkoutAssignment[] = [];

    // Long run (highest priority)
    const longRunDay = this.selectLongRunDay(workoutDays, prefs);
    assignments.push({
      dayOfWeek: longRunDay,
      workoutType: week === 14 ? WorkoutType.MARATHON_RACE : WorkoutType.LONG_RUN,
      priority: 1,
      isOptimal: this.isOptimalLongRunDay(longRunDay, prefs),
      conflicts: this.checkLongRunConflicts(longRunDay, workoutDays, prefs)
    });

    // Remaining days for other workouts
    const remainingDays = workoutDays.filter(day => day !== longRunDay);
    const [tempoDay, intervalDay] = this.assignTempoAndIntervals(remainingDays.slice(0, 2), prefs);
    const easyRunDay = remainingDays.find(day => day !== tempoDay && day !== intervalDay)!;

    assignments.push({
      dayOfWeek: tempoDay,
      workoutType: WorkoutType.TEMPO_RUN,
      priority: 2,
      isOptimal: this.isOptimalTempoDay(tempoDay, prefs),
      conflicts: this.checkTempoConflicts(tempoDay, workoutDays, prefs)
    });

    assignments.push({
      dayOfWeek: intervalDay,
      workoutType: WorkoutType.INTERVAL_800M,
      priority: 2,
      isOptimal: this.isOptimalIntervalDay(intervalDay, prefs),
      conflicts: this.checkIntervalConflicts(intervalDay, workoutDays, prefs)
    });

    assignments.push({
      dayOfWeek: easyRunDay,
      workoutType: WorkoutType.EASY_RUN,
      priority: 3,
      isOptimal: true, // Easy runs are flexible
      conflicts: []
    });

    return assignments.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  /**
   * Assign workouts for a 2-workout week (minimal)
   */
  private assignTwoWorkoutWeek(
    workoutDays: number[], 
    week: number, 
    prefs: WorkoutAssignmentPreferences
  ): WorkoutAssignment[] {
    const [day1, day2] = workoutDays;
    const assignments: WorkoutAssignment[] = [];

    // For 2 workouts: prioritize long run + one quality workout
    const longRunDay = this.selectLongRunDay(workoutDays, prefs);
    const qualityDay = workoutDays.find(day => day !== longRunDay)!;

    assignments.push({
      dayOfWeek: longRunDay,
      workoutType: week === 14 ? WorkoutType.MARATHON_RACE : WorkoutType.LONG_RUN,
      priority: 1,
      isOptimal: this.isOptimalLongRunDay(longRunDay, prefs),
      conflicts: this.checkLongRunConflicts(longRunDay, workoutDays, prefs)
    });

    // Alternate between tempo and intervals based on week
    const qualityWorkoutType = week % 2 === 0 ? WorkoutType.INTERVAL_800M : WorkoutType.TEMPO_RUN;
    assignments.push({
      dayOfWeek: qualityDay,
      workoutType: qualityWorkoutType,
      priority: 2,
      isOptimal: true,
      conflicts: []
    });

    return assignments.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  /**
   * Assign workouts for 5+ workout weeks (advanced)
   */
  private assignAdvancedWeek(
    workoutDays: number[], 
    week: number, 
    prefs: WorkoutAssignmentPreferences
  ): WorkoutAssignment[] {
    const assignments: WorkoutAssignment[] = [];

    // Long run (highest priority)
    const longRunDay = this.selectLongRunDay(workoutDays, prefs);
    assignments.push({
      dayOfWeek: longRunDay,
      workoutType: week === 14 ? WorkoutType.MARATHON_RACE : WorkoutType.LONG_RUN,
      priority: 1,
      isOptimal: this.isOptimalLongRunDay(longRunDay, prefs),
      conflicts: this.checkLongRunConflicts(longRunDay, workoutDays, prefs)
    });

    // Assign key workouts
    const remainingDays = workoutDays.filter(day => day !== longRunDay);
    const [tempoDay, intervalDay] = this.assignTempoAndIntervals(remainingDays.slice(0, 2), prefs);

    assignments.push({
      dayOfWeek: tempoDay,
      workoutType: WorkoutType.TEMPO_RUN,
      priority: 2,
      isOptimal: this.isOptimalTempoDay(tempoDay, prefs),
      conflicts: this.checkTempoConflicts(tempoDay, workoutDays, prefs)
    });

    assignments.push({
      dayOfWeek: intervalDay,
      workoutType: WorkoutType.INTERVAL_800M,
      priority: 2,
      isOptimal: this.isOptimalIntervalDay(intervalDay, prefs),
      conflicts: this.checkIntervalConflicts(intervalDay, workoutDays, prefs)
    });

    // Fill remaining days with easy runs and recovery runs
    const easyDays = remainingDays.filter(day => day !== tempoDay && day !== intervalDay);
    easyDays.forEach((day, index) => {
      const workoutType = index === 0 ? WorkoutType.RECOVERY_RUN : WorkoutType.EASY_RUN;
      assignments.push({
        dayOfWeek: day,
        workoutType,
        priority: 3,
        isOptimal: true,
        conflicts: []
      });
    });

    return assignments.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  /**
   * Select the best day for long runs
   */
  private selectLongRunDay(workoutDays: number[], prefs: WorkoutAssignmentPreferences): number {
    // If user has a preference, use it if available
    if (prefs.preferredLongRunDay && workoutDays.includes(prefs.preferredLongRunDay)) {
      return prefs.preferredLongRunDay;
    }

    // Prefer weekend days (Saturday=6, Sunday=7)
    if (prefs.preferWeekendLongRuns) {
      const weekendDays = workoutDays.filter(day => day === 6 || day === 7);
      if (weekendDays.length > 0) {
        return weekendDays[weekendDays.length - 1]!; // Prefer Sunday over Saturday
      }
    }

    // Default to the last workout day of the week
    return workoutDays[workoutDays.length - 1] ?? 7;
  }

  /**
   * Assign tempo and interval days optimally
   */
  private assignTempoAndIntervals(
    availableDays: number[], 
    prefs: WorkoutAssignmentPreferences
  ): [number, number] {
    if (availableDays.length < 2) {
      return [availableDays[0] ?? 1, availableDays[1] ?? 3];
    }

    // Check user preferences first
    if (prefs.preferredTempoDay && availableDays.includes(prefs.preferredTempoDay)) {
      const tempoDay = prefs.preferredTempoDay;
      const intervalDay = availableDays.find(day => day !== tempoDay) ?? availableDays[1] ?? 3;
      return [tempoDay, intervalDay];
    }

    if (prefs.preferredIntervalDay && availableDays.includes(prefs.preferredIntervalDay)) {
      const intervalDay = prefs.preferredIntervalDay;
      const tempoDay = availableDays.find(day => day !== intervalDay) ?? availableDays[0] ?? 1;
      return [tempoDay, intervalDay];
    }

    // Default assignment: earlier day for tempo, later for intervals
    return [availableDays[0] ?? 1, availableDays[1] ?? 3];
  }

  /**
   * Check if a day is optimal for long runs
   */
  private isOptimalLongRunDay(day: number, prefs: WorkoutAssignmentPreferences): boolean {
    if (prefs.preferredLongRunDay === day) return true;
    if (prefs.preferWeekendLongRuns && (day === 6 || day === 7)) return true;
    return false;
  }

  /**
   * Check if a day is optimal for tempo runs
   */
  private isOptimalTempoDay(day: number, prefs: WorkoutAssignmentPreferences): boolean {
    if (prefs.preferredTempoDay === day) return true;
    // Tempo runs are good mid-week (Tuesday-Thursday)
    return day >= 2 && day <= 4;
  }

  /**
   * Check if a day is optimal for interval runs
   */
  private isOptimalIntervalDay(day: number, prefs: WorkoutAssignmentPreferences): boolean {
    if (prefs.preferredIntervalDay === day) return true;
    // Intervals are good mid-week (Tuesday-Thursday)
    return day >= 2 && day <= 4;
  }

  /**
   * Check for conflicts with long run placement
   */
  private checkLongRunConflicts(
    longRunDay: number, 
    workoutDays: number[], 
    prefs: WorkoutAssignmentPreferences
  ): string[] {
    const conflicts: string[] = [];

    // Check if it's too close to other hard workouts
    if (prefs.avoidBackToBackHard) {
      const adjacentDays = [longRunDay - 1, longRunDay + 1].filter(day => 
        day >= 1 && day <= 7 && workoutDays.includes(day)
      );
      
      if (adjacentDays.length > 0) {
        conflicts.push('Long run scheduled adjacent to other workouts - consider more recovery time');
      }
    }

    return conflicts;
  }

  /**
   * Check for conflicts with tempo run placement
   */
  private checkTempoConflicts(
    tempoDay: number, 
    workoutDays: number[], 
    prefs: WorkoutAssignmentPreferences
  ): string[] {
    const conflicts: string[] = [];

    // Check spacing from other hard workouts
    if (prefs.avoidBackToBackHard) {
      const adjacentDays = [tempoDay - 1, tempoDay + 1].filter(day => 
        day >= 1 && day <= 7 && workoutDays.includes(day)
      );
      
      if (adjacentDays.length > 1) {
        conflicts.push('Tempo run between two other workouts - may impact recovery');
      }
    }

    return conflicts;
  }

  /**
   * Check for conflicts with interval placement
   */
  private checkIntervalConflicts(
    intervalDay: number, 
    workoutDays: number[], 
    prefs: WorkoutAssignmentPreferences
  ): string[] {
    const conflicts: string[] = [];

    // Similar logic to tempo conflicts
    if (prefs.avoidBackToBackHard) {
      const adjacentDays = [intervalDay - 1, intervalDay + 1].filter(day => 
        day >= 1 && day <= 7 && workoutDays.includes(day)
      );
      
      if (adjacentDays.length > 1) {
        conflicts.push('Interval session between two other workouts - may impact performance');
      }
    }

    return conflicts;
  }

  /**
   * Analyze the quality of a week's workout assignment
   */
  private analyzeWeekQuality(
    assignments: WorkoutAssignment[], 
    restDays: number[], 
    prefs: WorkoutAssignmentPreferences
  ): { score: number; suggestions: string[] } {
    let score = 100;
    const suggestions: string[] = [];

    // Check for optimal workout distribution
    const hardWorkouts = assignments.filter(a => 
      a.workoutType === WorkoutType.TEMPO_RUN || 
      a.workoutType === WorkoutType.INTERVAL_800M ||
      a.workoutType === WorkoutType.LONG_RUN ||
      a.workoutType === WorkoutType.MARATHON_RACE
    );

    // Penalize back-to-back hard workouts
    for (let i = 0; i < hardWorkouts.length - 1; i++) {
      const current = hardWorkouts[i];
      const next = hardWorkouts[i + 1];
      
      if (current && next && next.dayOfWeek - current.dayOfWeek === 1) {
        score -= 15;
        suggestions.push(`Consider adding rest between ${this.getWorkoutTypeName(current.workoutType)} and ${this.getWorkoutTypeName(next.workoutType)}`);
      }
    }

    // Check for optimal long run placement
    const longRun = assignments.find(a => a.workoutType === WorkoutType.LONG_RUN || a.workoutType === WorkoutType.MARATHON_RACE);
    if (longRun && !longRun.isOptimal) {
      score -= 10;
      suggestions.push('Consider moving long run to weekend for better recovery');
    }

    // Check for adequate rest days
    if (restDays.length < 2) {
      score -= 20;
      suggestions.push('Consider adding more rest days for better recovery');
    }

    // Bonus for following preferences
    const optimalAssignments = assignments.filter(a => a.isOptimal).length;
    const bonusPoints = (optimalAssignments / assignments.length) * 10;
    score += bonusPoints;

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      suggestions
    };
  }

  /**
   * Get human-readable workout type name
   */
  private getWorkoutTypeName(type: WorkoutType): string {
    const names = {
      [WorkoutType.EASY_RUN]: 'Easy Run',
      [WorkoutType.TEMPO_RUN]: 'Tempo Run',
      [WorkoutType.INTERVAL_800M]: 'Intervals',
      [WorkoutType.LONG_RUN]: 'Long Run',
      [WorkoutType.RECOVERY_RUN]: 'Recovery Run',
      [WorkoutType.MARATHON_RACE]: 'Marathon Race'
    };
    return names[type] || type;
  }

  /**
   * Generate suggestions for improving a workout schedule
   */
  public generateScheduleSuggestions(
    workoutDays: number[], 
    preferences: WorkoutAssignmentPreferences
  ): string[] {
    const suggestions: string[] = [];

    // Check workout frequency
    if (workoutDays.length < 3) {
      suggestions.push('Consider adding more workout days - 3-4 days per week is optimal for marathon training');
    } else if (workoutDays.length > 5) {
      suggestions.push('Consider reducing workout days to allow for adequate recovery');
    }

    // Check weekend availability
    const hasWeekend = workoutDays.some(day => day === 6 || day === 7);
    if (!hasWeekend) {
      suggestions.push('Consider adding a weekend day for long runs');
    }

    // Check spacing
    const sortedDays = [...workoutDays].sort();
    for (let i = 0; i < sortedDays.length - 1; i++) {
      const currentDay = sortedDays[i];
      const nextDay = sortedDays[i + 1];
      
      if (currentDay !== undefined && nextDay !== undefined && nextDay - currentDay === 1) {
        suggestions.push('Consider spacing out consecutive workout days for better recovery');
        break;
      }
    }

    return suggestions;
  }

  private analyzeScheduleQuality(
    assignments: WorkoutAssignment[],
    preferences: WorkoutAssignmentPreferences
  ): { score: number; suggestions: string[] } {
    const suggestions: string[] = [];
    let score = 100;

    // Sort assignments by day for analysis
    const sortedDays = assignments
      .map(a => a.dayOfWeek)
      .sort((a, b) => a - b);

    // Check for back-to-back hard workouts
    for (let i = 0; i < sortedDays.length - 1; i++) {
      const currentDay = sortedDays[i];
      const nextDay = sortedDays[i + 1];
      
      // Safe array access with null checks
      if (currentDay !== undefined && nextDay !== undefined) {
        const currentAssignment = assignments.find(a => a.dayOfWeek === currentDay);
        const nextAssignment = assignments.find(a => a.dayOfWeek === nextDay);
        
        if (currentAssignment && nextAssignment) {
          const isCurrentHard = this.isHighIntensityWorkout(currentAssignment.workoutType);
          const isNextHard = this.isHighIntensityWorkout(nextAssignment.workoutType);
          
          if (isCurrentHard && isNextHard && nextDay - currentDay === 1) {
            score -= 15;
            suggestions.push(`Consider spacing out ${currentAssignment.workoutType} and ${nextAssignment.workoutType} workouts`);
          }
        }
      }
    }

    // Check for optimal long run placement
    const longRun = assignments.find(a => a.workoutType === WorkoutType.LONG_RUN || a.workoutType === WorkoutType.MARATHON_RACE);
    if (longRun && !longRun.isOptimal) {
      score -= 10;
      suggestions.push('Consider moving long run to weekend for better recovery');
    }

    // Check for adequate rest days
    if (sortedDays.length < 2) {
      score -= 20;
      suggestions.push('Consider adding more rest days for better recovery');
    }

    // Bonus for following preferences
    const optimalAssignments = assignments.filter(a => a.isOptimal).length;
    const bonusPoints = (optimalAssignments / assignments.length) * 10;
    score += bonusPoints;

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      suggestions
    };
  }

  private isHighIntensityWorkout(workoutType: WorkoutType): boolean {
    const highIntensityTypes: WorkoutType[] = [
      WorkoutType.TEMPO_RUN,
      WorkoutType.INTERVAL_800M,
      WorkoutType.LONG_RUN,
      WorkoutType.MARATHON_RACE
    ];
    return highIntensityTypes.includes(workoutType);
  }
} 