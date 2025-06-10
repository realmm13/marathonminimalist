import { WorkoutAssignmentPreferences } from './workout-assignment-engine';

export interface RestDayConflict {
  day: number;
  type: 'workout_on_rest_day' | 'insufficient_rest' | 'too_many_rest_days';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestions: string[];
}

export interface RestDayAnalysis {
  conflicts: RestDayConflict[];
  recommendations: string[];
  qualityScore: number; // 0-100
  isValid: boolean;
}

export class RestDayManager {
  /**
   * Validate rest day configuration against workout days
   */
  public static validateRestDays(
    workoutDays: number[],
    preferredRestDays: number[],
    preferences: WorkoutAssignmentPreferences = {}
  ): RestDayAnalysis {
    const conflicts: RestDayConflict[] = [];
    const recommendations: string[] = [];
    let qualityScore = 100;

    // Check for direct conflicts (workout scheduled on preferred rest day)
    const directConflicts = workoutDays.filter(day => preferredRestDays.includes(day));
    directConflicts.forEach(day => {
      conflicts.push({
        day,
        type: 'workout_on_rest_day',
        severity: preferences.enforceRestDays ? 'high' : 'medium',
        description: `Workout scheduled on preferred rest day (${this.getDayName(day)})`,
        suggestions: [
          `Move workout to a different day`,
          `Remove ${this.getDayName(day)} from preferred rest days`,
          `Consider this as a flexible rest day`
        ]
      });
      qualityScore -= preferences.enforceRestDays ? 25 : 15;
    });

    // Check for insufficient rest (less than 2 rest days per week)
    const totalRestDays = 7 - workoutDays.length;
    if (totalRestDays < 2) {
      conflicts.push({
        day: 0, // General conflict
        type: 'insufficient_rest',
        severity: 'high',
        description: `Only ${totalRestDays} rest day${totalRestDays === 1 ? '' : 's'} per week - minimum 2 recommended`,
        suggestions: [
          'Reduce number of workout days',
          'Consider alternating high and low intensity days',
          'Add recovery runs instead of complete rest'
        ]
      });
      qualityScore -= 30;
    }

    // Check for too many consecutive workout days
    const consecutiveWorkouts = this.findConsecutiveWorkoutDays(workoutDays);
    if (consecutiveWorkouts.length > 0) {
      consecutiveWorkouts.forEach(sequence => {
        if (sequence.length > 3) {
          const firstDay = sequence[0];
          if (firstDay !== undefined) {
            conflicts.push({
              day: firstDay,
              type: 'insufficient_rest',
              severity: 'medium',
              description: `${sequence.length} consecutive workout days detected`,
              suggestions: [
                'Add rest day in the middle of the sequence',
                'Replace one workout with a recovery run',
                'Consider active recovery activities'
              ]
            });
            qualityScore -= 10;
          }
        }
      });
    }

    // Generate recommendations
    if (preferredRestDays.length === 0) {
      recommendations.push('Consider setting preferred rest days for better recovery planning');
    }

    if (totalRestDays >= 3 && preferredRestDays.length < 2) {
      recommendations.push('You have flexibility to add more preferred rest days');
    }

    // Check for optimal rest day placement
    const weekendRestDays = preferredRestDays.filter(day => day === 6 || day === 7);
    if (weekendRestDays.length === 0 && workoutDays.some(day => day === 6 || day === 7)) {
      recommendations.push('Consider keeping at least one weekend day for rest and recovery');
    }

    return {
      conflicts,
      recommendations,
      qualityScore: Math.max(0, qualityScore),
      isValid: conflicts.filter(c => c.severity === 'high').length === 0
    };
  }

  /**
   * Suggest optimal rest day placement
   */
  public static suggestOptimalRestDays(
    workoutDays: number[],
    targetRestDays = 2
  ): number[] {
    const allDays = [1, 2, 3, 4, 5, 6, 7];
    const availableRestDays = allDays.filter(day => !workoutDays.includes(day));
    
    if (availableRestDays.length <= targetRestDays) {
      return availableRestDays;
    }

    // Prioritize days that provide best spacing
    const scoredDays = availableRestDays.map(day => ({
      day,
      score: this.calculateRestDayScore(day, workoutDays)
    }));

    return scoredDays
      .sort((a, b) => b.score - a.score)
      .slice(0, targetRestDays)
      .map(item => item.day)
      .sort();
  }

  /**
   * Calculate score for a potential rest day based on workout spacing
   */
  private static calculateRestDayScore(restDay: number, workoutDays: number[]): number {
    let score = 0;

    // Prefer days that break up consecutive workouts
    const prevDay = restDay === 1 ? 7 : restDay - 1;
    const nextDay = restDay === 7 ? 1 : restDay + 1;
    
    if (workoutDays.includes(prevDay) && workoutDays.includes(nextDay)) {
      score += 20; // High value for breaking consecutive workouts
    }

    // Slight preference for weekends (recovery time)
    if (restDay === 6 || restDay === 7) {
      score += 5;
    }

    // Prefer Monday for recovery from weekend long runs
    if (restDay === 1 && workoutDays.includes(7)) {
      score += 10;
    }

    return score;
  }

  /**
   * Find sequences of consecutive workout days
   */
  private static findConsecutiveWorkoutDays(workoutDays: number[]): number[][] {
    const sorted = [...workoutDays].sort();
    const sequences: number[][] = [];
    let currentSequence: number[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const currentDay = sorted[i];
      const prevDay = sorted[i - 1];

      if (currentDay !== undefined) {
        if (prevDay === undefined || currentDay - prevDay === 1) {
          currentSequence.push(currentDay);
        } else {
          if (currentSequence.length > 1) {
            sequences.push([...currentSequence]);
          }
          currentSequence = [currentDay];
        }
      }
    }

    if (currentSequence.length > 1) {
      sequences.push(currentSequence);
    }

    // Check for wrap-around (Sunday to Monday)
    if (sorted.includes(7) && sorted.includes(1)) {
      const sundayIndex = sorted.indexOf(7);
      const mondayIndex = sorted.indexOf(1);
      
      // If Sunday is at the end and Monday at the beginning, they're consecutive
      if (sundayIndex === sorted.length - 1 && mondayIndex === 0) {
        sequences.push([7, 1]);
      }
    }

    return sequences;
  }

  /**
   * Get human-readable day name
   */
  private static getDayName(day: number): string {
    const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[day] || 'Unknown';
  }

  /**
   * Auto-resolve rest day conflicts by suggesting alternative configurations
   */
  public static resolveConflicts(
    workoutDays: number[],
    preferredRestDays: number[],
    preferences: WorkoutAssignmentPreferences = {}
  ): {
    suggestedWorkoutDays: number[];
    suggestedRestDays: number[];
    changes: string[];
  } {
    const changes: string[] = [];
    let newWorkoutDays = [...workoutDays];
    let newRestDays = [...preferredRestDays];

    // Remove direct conflicts by adjusting workout days if rest days are enforced
    if (preferences.enforceRestDays) {
      const conflicts = workoutDays.filter(day => preferredRestDays.includes(day));
      
      conflicts.forEach(conflictDay => {
        // Try to move workout to adjacent day
        const alternatives = [conflictDay - 1, conflictDay + 1]
          .map(day => day < 1 ? 7 : day > 7 ? 1 : day)
          .filter(day => !workoutDays.includes(day) && !preferredRestDays.includes(day));

        if (alternatives.length > 0) {
          const newDay = alternatives[0];
          newWorkoutDays = newWorkoutDays.filter(d => d !== conflictDay);
          newWorkoutDays.push(newDay!);
          changes.push(`Moved workout from ${this.getDayName(conflictDay)} to ${this.getDayName(newDay!)}`);
        } else {
          // Remove from rest days if no alternative
          newRestDays = newRestDays.filter(d => d !== conflictDay);
          changes.push(`Removed ${this.getDayName(conflictDay)} from preferred rest days`);
        }
      });
    }

    return {
      suggestedWorkoutDays: newWorkoutDays.sort(),
      suggestedRestDays: newRestDays.sort(),
      changes
    };
  }
} 