import { WorkoutType } from '@/generated/prisma';
import { WorkoutAssignmentPreferences, WorkoutAssignment, WeeklyAssignment } from './workout-assignment-engine';

export interface WeekTemplate {
  id: string;
  name: string;
  description: string;
  workoutDays: number[];
  workoutTypes: Record<number, WorkoutType>;
  intensity: 'easy' | 'moderate' | 'hard' | 'recovery' | 'race';
  isDefault?: boolean;
}

export interface WeekCustomization {
  weekNumber: number;
  templateId?: string;
  customAssignments?: WorkoutAssignment[];
  isCustomized: boolean;
  notes?: string;
}

export interface WeekComparison {
  weekNumber: number;
  defaultDays: number[];
  overrideDays: number[];
  differences: {
    added: number[];
    removed: number[];
    unchanged: number[];
  };
  impactScore: number;
}

export interface BulkOperation {
  type: 'copy' | 'reset' | 'apply_template';
  sourceWeek?: number;
  targetWeeks: number[];
  template?: WeekTemplate;
}

export class WeekTemplateManager {
  private static readonly DEFAULT_TEMPLATES: WeekTemplate[] = [
    {
      id: 'standard',
      name: 'Standard Week',
      description: 'Balanced training with tempo, intervals, and long run',
      workoutDays: [2, 4, 6], // Tuesday, Thursday, Saturday
      workoutTypes: {
        2: WorkoutType.TEMPO_RUN,
        4: WorkoutType.INTERVAL_800M,
        6: WorkoutType.LONG_RUN
      },
      intensity: 'moderate',
      isDefault: true
    },
    {
      id: 'easy',
      name: 'Easy Week',
      description: 'Lower intensity for recovery or beginners',
      workoutDays: [2, 4, 6],
      workoutTypes: {
        2: WorkoutType.EASY_RUN,
        4: WorkoutType.EASY_RUN,
        6: WorkoutType.LONG_RUN
      },
      intensity: 'easy'
    },
    {
      id: 'hard',
      name: 'Hard Week',
      description: 'High intensity training for experienced runners',
      workoutDays: [1, 3, 5, 6], // Monday, Wednesday, Friday, Saturday
      workoutTypes: {
        1: WorkoutType.TEMPO_RUN,
        3: WorkoutType.INTERVAL_800M,
        5: WorkoutType.EASY_RUN,
        6: WorkoutType.LONG_RUN
      },
      intensity: 'hard'
    },
    {
      id: 'recovery',
      name: 'Recovery Week',
      description: 'Light training for recovery and adaptation',
      workoutDays: [3, 6], // Wednesday, Saturday
      workoutTypes: {
        3: WorkoutType.EASY_RUN,
        6: WorkoutType.RECOVERY_RUN
      },
      intensity: 'recovery'
    },
    {
      id: 'race',
      name: 'Race Week',
      description: 'Taper week leading to race day',
      workoutDays: [2, 4, 7], // Tuesday, Thursday, Sunday (race day)
      workoutTypes: {
        2: WorkoutType.EASY_RUN,
        4: WorkoutType.EASY_RUN,
        7: WorkoutType.MARATHON_RACE
      },
      intensity: 'race'
    }
  ];

  private customizations = new Map<number, WeekCustomization>();
  private customTemplates: WeekTemplate[] = [];

  constructor() {
    this.loadCustomizations();
  }

  /**
   * Get all available templates (default + custom)
   */
  getAvailableTemplates(): WeekTemplate[] {
    return [...WeekTemplateManager.DEFAULT_TEMPLATES, ...this.customTemplates];
  }

  /**
   * Get a specific template by ID
   */
  getTemplate(templateId: string): WeekTemplate | null {
    const allTemplates = this.getAvailableTemplates();
    return allTemplates.find(t => t.id === templateId) || null;
  }

  /**
   * Apply a template to a specific week
   */
  applyTemplateToWeek(weekNumber: number, templateId: string): WeekCustomization {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const customization: WeekCustomization = {
      weekNumber,
      templateId,
      isCustomized: true,
      notes: `Applied ${template.name} template`
    };

    this.customizations.set(weekNumber, customization);
    this.saveCustomizations();
    return customization;
  }

  /**
   * Apply custom assignments to a specific week
   */
  applyCustomAssignments(weekNumber: number, assignments: WorkoutAssignment[]): WeekCustomization {
    const customization: WeekCustomization = {
      weekNumber,
      customAssignments: assignments,
      isCustomized: true,
      notes: 'Custom workout assignments'
    };

    this.customizations.set(weekNumber, customization);
    this.saveCustomizations();
    return customization;
  }

  /**
   * Copy week configuration to other weeks
   */
  copyWeekToOthers(sourceWeek: number, targetWeeks: number[]): WeekCustomization[] {
    const sourceCustomization = this.customizations.get(sourceWeek);
    if (!sourceCustomization) {
      throw new Error(`Week ${sourceWeek} has no customization to copy`);
    }

    const results: WeekCustomization[] = [];
    
    for (const targetWeek of targetWeeks) {
      const newCustomization: WeekCustomization = {
        ...sourceCustomization,
        weekNumber: targetWeek,
        notes: `Copied from week ${sourceWeek}`
      };
      
      this.customizations.set(targetWeek, newCustomization);
      results.push(newCustomization);
    }

    this.saveCustomizations();
    return results;
  }

  /**
   * Reset weeks to default schedule
   */
  resetWeeksToDefault(weekNumbers: number[]): void {
    for (const weekNumber of weekNumbers) {
      this.customizations.delete(weekNumber);
    }
    this.saveCustomizations();
  }

  /**
   * Get customization for a specific week
   */
  getWeekCustomization(weekNumber: number): WeekCustomization | null {
    return this.customizations.get(weekNumber) || null;
  }

  /**
   * Get all customized weeks
   */
  getCustomizedWeeks(): WeekCustomization[] {
    return Array.from(this.customizations.values());
  }

  /**
   * Compare two weeks and identify differences
   */
  compareWeeks(week1: number, week2: number): WeekComparison {
    const custom1 = this.customizations.get(week1);
    const custom2 = this.customizations.get(week2);
    
    // Get effective assignments for both weeks
    const assignments1 = this.getEffectiveAssignments(week1);
    const assignments2 = this.getEffectiveAssignments(week2);
    
    const workoutDays1 = assignments1.map(a => a.dayOfWeek).sort();
    const workoutDays2 = assignments2.map(a => a.dayOfWeek).sort();
    
    const differences = {
      added: workoutDays2.filter(day => !workoutDays1.includes(day)),
      removed: workoutDays1.filter(day => !workoutDays2.includes(day)),
      unchanged: workoutDays1.filter(day => workoutDays2.includes(day))
    };

    // Determine conflict level
    let conflictLevel: 'none' | 'minor' | 'major' = 'none';
    if (differences.added.length > 0 || differences.removed.length > 0) {
      conflictLevel = 'minor';
    }

    return {
      weekNumber: week2,
      defaultDays: workoutDays1,
      overrideDays: workoutDays2,
      differences,
      impactScore: 0
    };
  }

  /**
   * Detect conflicts between adjacent weeks
   */
  detectAdjacentWeekConflicts(weekNumber: number): string[] {
    const conflicts: string[] = [];
    const currentAssignments = this.getEffectiveAssignments(weekNumber);
    
    // Check previous week
    if (weekNumber > 1) {
      const prevAssignments = this.getEffectiveAssignments(weekNumber - 1);
      const prevSunday = prevAssignments.find(a => a.dayOfWeek === 0); // Sunday
      const currentMonday = currentAssignments.find(a => a.dayOfWeek === 1); // Monday
      
      if (prevSunday && currentMonday) {
        const prevIsHard = this.isHighIntensityWorkout(prevSunday.workoutType);
        const currentIsHard = this.isHighIntensityWorkout(currentMonday.workoutType);
        
        if (prevIsHard && currentIsHard) {
          conflicts.push(`Back-to-back hard workouts: Week ${weekNumber - 1} Sunday and Week ${weekNumber} Monday`);
        }
      }
    }

    // Check next week
    if (weekNumber < 14) {
      const nextAssignments = this.getEffectiveAssignments(weekNumber + 1);
      const currentSunday = currentAssignments.find(a => a.dayOfWeek === 0); // Sunday
      const nextMonday = nextAssignments.find(a => a.dayOfWeek === 1); // Monday
      
      if (currentSunday && nextMonday) {
        const currentIsHard = this.isHighIntensityWorkout(currentSunday.workoutType);
        const nextIsHard = this.isHighIntensityWorkout(nextMonday.workoutType);
        
        if (currentIsHard && nextIsHard) {
          conflicts.push(`Back-to-back hard workouts: Week ${weekNumber} Sunday and Week ${weekNumber + 1} Monday`);
        }
      }
    }

    return conflicts;
  }

  /**
   * Get effective assignments for a week (considering customizations)
   */
  private getEffectiveAssignments(weekNumber: number): WorkoutAssignment[] {
    const customization = this.customizations.get(weekNumber);
    
    if (customization?.customAssignments) {
      return customization.customAssignments;
    }
    
    if (customization?.templateId) {
      const template = this.getTemplate(customization.templateId);
      if (template) {
        return this.templateToAssignments(template);
      }
    }
    
    // Return default assignments
    const defaultTemplate = this.getTemplate('standard');
    return defaultTemplate ? this.templateToAssignments(defaultTemplate) : [];
  }

  /**
   * Convert template to workout assignments
   */
  private templateToAssignments(template: WeekTemplate): WorkoutAssignment[] {
    return template.workoutDays.map(day => {
      const workoutType = template.workoutTypes[day];
      if (!workoutType) {
        throw new Error(`No workout type defined for day ${day} in template ${template.id}`);
      }
      return {
        dayOfWeek: day,
        workoutType,
        priority: workoutType === WorkoutType.LONG_RUN || workoutType === WorkoutType.MARATHON_RACE ? 1 : 2,
        isOptimal: true,
        conflicts: []
      };
    });
  }

  /**
   * Check if workout type is high intensity
   */
  private isHighIntensityWorkout(workoutType: WorkoutType): boolean {
    const highIntensityTypes: WorkoutType[] = [
      WorkoutType.TEMPO_RUN,
      WorkoutType.INTERVAL_800M,
      WorkoutType.LONG_RUN,
      WorkoutType.MARATHON_RACE
    ];
    return highIntensityTypes.includes(workoutType);
  }

  /**
   * Create a custom template
   */
  createCustomTemplate(template: Omit<WeekTemplate, 'id'>): WeekTemplate {
    const id = `custom_${Date.now()}`;
    const newTemplate: WeekTemplate = { ...template, id };
    
    this.customTemplates.push(newTemplate);
    this.saveCustomizations();
    
    return newTemplate;
  }

  /**
   * Delete a custom template
   */
  deleteCustomTemplate(templateId: string): boolean {
    const index = this.customTemplates.findIndex(t => t.id === templateId);
    if (index === -1) return false;
    
    this.customTemplates.splice(index, 1);
    this.saveCustomizations();
    
    return true;
  }

  /**
   * Get training plan consistency score
   */
  getTrainingPlanConsistency(): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;
    
    // Check for too many consecutive hard weeks
    let consecutiveHardWeeks = 0;
    for (let week = 1; week <= 14; week++) {
      const assignments = this.getEffectiveAssignments(week);
      const hardWorkouts = assignments.filter(a => this.isHighIntensityWorkout(a.workoutType)).length;
      
      if (hardWorkouts >= 3) {
        consecutiveHardWeeks++;
        if (consecutiveHardWeeks >= 3) {
          score -= 15;
          issues.push(`Too many consecutive hard weeks (weeks ${week - 2}-${week})`);
        }
      } else {
        consecutiveHardWeeks = 0;
      }
    }
    
    // Check for adequate recovery weeks
    const recoveryWeeks = Array.from({ length: 14 }, (_, i) => i + 1)
      .filter(week => {
        const assignments = this.getEffectiveAssignments(week);
        return assignments.length <= 2;
      });
    
    if (recoveryWeeks.length < 2) {
      score -= 10;
      issues.push('Consider adding more recovery weeks');
    }
    
    // Check for proper race week taper
    const raceWeekAssignments = this.getEffectiveAssignments(14);
    const raceWeekHardWorkouts = raceWeekAssignments.filter(a => 
      this.isHighIntensityWorkout(a.workoutType) && a.workoutType !== WorkoutType.MARATHON_RACE
    ).length;
    
    if (raceWeekHardWorkouts > 1) {
      score -= 20;
      issues.push('Race week should have minimal hard workouts before the marathon');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      issues
    };
  }

  /**
   * Load customizations from storage
   */
  private loadCustomizations(): void {
    try {
      const stored = localStorage.getItem('weekCustomizations');
      if (stored) {
        const data = JSON.parse(stored);
        this.customizations = new Map(data.customizations || []);
        this.customTemplates = data.customTemplates || [];
      }
    } catch (error) {
      console.warn('Failed to load week customizations:', error);
    }
  }

  /**
   * Save customizations to storage
   */
  private saveCustomizations(): void {
    try {
      const data = {
        customizations: Array.from(this.customizations.entries()),
        customTemplates: this.customTemplates
      };
      localStorage.setItem('weekCustomizations', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save week customizations:', error);
    }
  }

  /**
   * Get all available week templates
   */
  public static getTemplates(includeCustom = true): WeekTemplate[] {
    // In a real app, custom templates would be loaded from user preferences
    return this.DEFAULT_TEMPLATES;
  }

  /**
   * Get templates by intensity level
   */
  public static getTemplatesByIntensity(intensity: WeekTemplate['intensity']): WeekTemplate[] {
    return this.DEFAULT_TEMPLATES.filter(template => template.intensity === intensity);
  }

  /**
   * Find the best matching template for given workout days
   */
  public static findBestMatchingTemplate(workoutDays: number[]): WeekTemplate | null {
    let bestMatch: WeekTemplate | null = null;
    let bestScore = -1;

    for (const template of this.DEFAULT_TEMPLATES) {
      const score = this.calculateTemplateMatchScore(workoutDays, template.workoutDays);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = template;
      }
    }

    return bestScore > 0.5 ? bestMatch : null;
  }

  /**
   * Calculate how well workout days match a template (0-1)
   */
  private static calculateTemplateMatchScore(workoutDays: number[], templateDays: number[]): number {
    const workoutSet = new Set(workoutDays);
    const templateSet = new Set(templateDays);
    
    const intersection = new Set([...workoutSet].filter(day => templateSet.has(day)));
    const union = new Set([...workoutSet, ...templateSet]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Compare weeks to identify differences
   */
  public static compareWeeks(
    weekNumber: number,
    defaultDays: number[],
    overrideDays: number[]
  ): WeekComparison {
    const defaultSet = new Set(defaultDays);
    const overrideSet = new Set(overrideDays);

    const added = overrideDays.filter(day => !defaultSet.has(day));
    const removed = defaultDays.filter(day => !overrideSet.has(day));
    const unchanged = defaultDays.filter(day => overrideSet.has(day));

    // Calculate impact score (0-10)
    const totalChanges = added.length + removed.length;
    const maxPossibleChanges = Math.max(defaultDays.length, overrideDays.length, 7);
    const impactScore = Math.round((totalChanges / maxPossibleChanges) * 10);

    return {
      weekNumber,
      defaultDays,
      overrideDays,
      differences: {
        added,
        removed,
        unchanged
      },
      impactScore
    };
  }

  /**
   * Validate bulk operation
   */
  public static validateBulkOperation(
    operation: BulkOperation,
    totalWeeks: number,
    existingOverrides: Record<number, number[]>
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate target weeks
    const invalidWeeks = operation.targetWeeks.filter(week => week < 1 || week > totalWeeks);
    if (invalidWeeks.length > 0) {
      errors.push(`Invalid week numbers: ${invalidWeeks.join(', ')}`);
    }

    // Validate source week for copy operations
    if (operation.type === 'copy') {
      if (!operation.sourceWeek) {
        errors.push('Source week is required for copy operations');
      } else if (operation.sourceWeek < 1 || operation.sourceWeek > totalWeeks) {
        errors.push(`Invalid source week: ${operation.sourceWeek}`);
      }
    }

    // Validate template for apply_template operations
    if (operation.type === 'apply_template' && !operation.template) {
      errors.push('Template is required for apply_template operations');
    }

    // Check for existing overrides that will be affected
    const affectedWeeks = operation.targetWeeks.filter(week => existingOverrides[week]);
    if (affectedWeeks.length > 0) {
      warnings.push(`This will overwrite existing customizations for weeks: ${affectedWeeks.join(', ')}`);
    }

    // Check for race week (typically week 14)
    const raceWeek = 14;
    if (operation.targetWeeks.includes(raceWeek)) {
      warnings.push('Modifying race week schedule - ensure this aligns with your race strategy');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Execute bulk operation
   */
  public static executeBulkOperation(
    operation: BulkOperation,
    defaultWorkoutDays: number[],
    existingOverrides: Record<number, number[]>
  ): Record<number, number[]> {
    const newOverrides = { ...existingOverrides };

    switch (operation.type) {
      case 'copy':
        if (operation.sourceWeek) {
          const sourceDays = existingOverrides[operation.sourceWeek] || defaultWorkoutDays;
          operation.targetWeeks.forEach(week => {
            newOverrides[week] = [...sourceDays];
          });
        }
        break;

      case 'reset':
        operation.targetWeeks.forEach(week => {
          delete newOverrides[week];
        });
        break;

      case 'apply_template':
        if (operation.template) {
          operation.targetWeeks.forEach(week => {
            newOverrides[week] = [...operation.template!.workoutDays];
          });
        }
        break;
    }

    return newOverrides;
  }

  /**
   * Generate suggestions for week adjustments
   */
  public static generateWeekSuggestions(
    weekNumber: number,
    currentDays: number[],
    totalWeeks: number
  ): string[] {
    const suggestions: string[] = [];

    // Race week suggestions (typically week 14)
    if (weekNumber === totalWeeks) {
      suggestions.push('Consider reducing to 2 easy workouts for race week taper');
      if (currentDays.length > 2) {
        suggestions.push('Race week typically benefits from minimal training volume');
      }
    }

    // Peak weeks (weeks 10-12)
    if (weekNumber >= totalWeeks - 4 && weekNumber <= totalWeeks - 2) {
      if (currentDays.length < 3) {
        suggestions.push('Peak training weeks typically benefit from 3-4 workouts');
      }
    }

    // Early weeks (weeks 1-4)
    if (weekNumber <= 4) {
      if (currentDays.length > 3) {
        suggestions.push('Consider starting with 3 workouts per week to build base fitness');
      }
    }

    // Weekend long run suggestion
    const hasWeekend = currentDays.some(day => day === 6 || day === 7);
    if (!hasWeekend && currentDays.length >= 3) {
      suggestions.push('Consider adding a weekend day for long runs');
    }

    // Consecutive day warning
    const sortedDays = [...currentDays].sort();
    for (let i = 0; i < sortedDays.length - 2; i++) {
      const day1 = sortedDays[i];
      const day2 = sortedDays[i + 1];
      const day3 = sortedDays[i + 2];
      
      if (day1 !== undefined && day2 !== undefined && day3 !== undefined) {
        if (day2 === day1 + 1 && day3 === day2 + 1) {
          suggestions.push('Avoid 3+ consecutive workout days for better recovery');
          break;
        }
      }
    }

    return suggestions;
  }

  /**
   * Create a custom template from workout days
   */
  public static createCustomTemplate(
    name: string,
    description: string,
    workoutDays: number[],
    intensity: WeekTemplate['intensity'] = 'moderate'
  ): WeekTemplate {
    // Create default workout types mapping
    const workoutTypes: Record<number, WorkoutType> = {};
    workoutDays.forEach(day => {
      // Assign default workout types based on day
      if (day === 0 || day === 6) { // Weekend
        workoutTypes[day] = WorkoutType.LONG_RUN;
      } else {
        workoutTypes[day] = WorkoutType.EASY_RUN;
      }
    });

    return {
      id: `custom_${Date.now()}`,
      name,
      description,
      workoutDays: [...workoutDays],
      workoutTypes,
      intensity
    };
  }
} 