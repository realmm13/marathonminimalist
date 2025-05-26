import { ExperienceLevel, WorkoutType, DistanceUnit, PaceFormat } from '../generated/prisma';

// Base training types
export interface PaceTime {
  minutes: number;
  seconds: number;
}

export interface MarathonTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TrainingPreferences {
  distanceUnit: DistanceUnit;
  paceFormat: PaceFormat;
  workoutDays: number[]; // Array of day numbers (1=Monday, 7=Sunday)
}

// Tempo run specific types
export interface TempoRunParams {
  goalMarathonTime?: string; // Format: "HH:MM:SS"
  week: number; // Training week (1-14)
  preferences: TrainingPreferences;
}

export interface TempoRunWorkout {
  name: string;
  description: string;
  type: WorkoutType;
  week: number;
  warmUpDistance: number; // in km
  tempoDistance: number; // in km
  coolDownDistance: number; // in km
  totalDistance: number; // in km
  targetPace: string; // Format: "MM:SS" per km/mile
  estimatedDuration: number; // in minutes
  instructions: string[];
}

// Interval training types
export interface IntervalParams {
  goalMarathonTime?: string;
  week: number;
  preferences: TrainingPreferences;
}

export interface IntervalSet {
  distance: number; // 800m = 0.8km
  repetitions: number;
  targetPace: string; // Format: "MM:SS" per km/mile
  recoveryTime: number; // in seconds
}

export interface IntervalWorkout {
  name: string;
  description: string;
  type: WorkoutType;
  week: number;
  warmUpDistance: number;
  coolDownDistance: number;
  intervals: IntervalSet[];
  totalDistance: number;
  estimatedDuration: number;
  instructions: string[];
}

// Long run types
export interface LongRunParams {
  goalMarathonTime?: string;
  week: number;
  preferences: TrainingPreferences;
}

export interface LongRunWorkout {
  name: string;
  description: string;
  type: WorkoutType;
  week: number;
  easyRunDistance: number; // in km/miles based on preferences
  marathonPaceDistance: number; // in km/miles based on preferences
  totalDistance: number; // in km/miles based on preferences
  targetEasyPace: string; // Format: "MM:SS" per km/mile
  targetMarathonPace: string; // Format: "MM:SS" per km/mile
  estimatedDuration: number; // in minutes
  instructions: string[];
}

// Training plan generation types
export interface TrainingPlanParams {
  userId: string;
  experienceLevel: ExperienceLevel;
  goalMarathonTime?: string;
  marathonDate: Date;
  startDate: Date;
  preferences: TrainingPreferences;
}

export interface WeeklyPlan {
  week: number;
  workouts: (TempoRunWorkout | IntervalWorkout | LongRunWorkout)[];
  totalDistance: number;
  description: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  experienceLevel: ExperienceLevel;
  goalTime?: string;
  weeklyPlans: WeeklyPlan[];
  totalWeeks: number;
}

// Pace calculation utilities
export interface PaceCalculationResult {
  marathonPace: PaceTime;
  tempoPace: PaceTime;
  intervalPace: PaceTime;
  easyPace: PaceTime;
  longRunPace: PaceTime;
  unit: DistanceUnit;
}

// Training progression types
export interface ProgressionParams {
  totalWeeks: number;
  peakWeek: number; // Usually week 10-12
}

export interface DistanceProgression {
  week: number;
  tempoDistance: number;
  longRunDistance: number;
  weeklyVolume: number;
} 