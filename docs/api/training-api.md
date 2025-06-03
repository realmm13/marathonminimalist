# Training API Documentation

This document provides comprehensive documentation for the Marathon Minimalist Training API.

## Overview

The Training API provides endpoints for generating personalized marathon training plans, managing workout logs, and handling user preferences. The API is built using tRPC for type-safe communication between the frontend and backend.

**Training Algorithm Methodology:**
The training plan generation uses proven methodologies based on Jack Daniels' running formulas, focusing on:
- Scientifically-backed pace calculations
- Progressive distance increases
- Balanced workout distribution
- Simple, effective training principles

## Core Concepts

### Training Plans
Training plans are generated dynamically based on user preferences and goals. Plans consist of 16 weeks of structured workouts including:
- Easy runs for aerobic base building
- Tempo runs for lactate threshold improvement  
- Interval workouts for VO2 max development
- Long runs for endurance and race preparation

### Workout Types
- **Easy Run**: Comfortable aerobic pace runs
- **Tempo Run**: Comfortably hard sustained efforts
- **Intervals**: Short, intense repetitions with recovery
- **Long Run**: Extended distance runs at easy to moderate pace

### Pace Calculations
All training paces are calculated using Jack Daniels' VDOT methodology:
- Easy pace: Conversational effort for aerobic development
- Tempo pace: Comfortably hard pace for lactate threshold
- Interval pace: 5K race pace for VO2 max improvement
- Long run pace: Easy to moderate pace for endurance

## Base URL

All training endpoints are available under the `/api/trpc/training` namespace when using tRPC client, or can be accessed via the tRPC router in the application.

## Authentication

All training endpoints require user authentication. Unauthenticated requests will receive a `401 Unauthorized` response.

## Endpoints

### 1. Generate Training Plan

**Endpoint:** `training.generatePlan`  
**Method:** `query`  
**Description:** Generates or retrieves a personalized 16-week marathon training plan based on user preferences and goals.

#### Input Schema

```typescript
{
  startDate?: string;      // ISO date string, optional - defaults to calculated from race date
  workoutDays?: number[];  // Array of weekday numbers (1-7), optional - defaults to user preferences
}
```

#### Response Schema

```typescript
{
  success: boolean;
  plan: {
    totalWeeks: number;
    workouts: Array<{
      id: string;           // Format: "week-day" (e.g., "1-1")
      week: number;         // Week number (1-16)
      day: number;          // Day of week (1-7, Monday=1)
      date: string;         // ISO date string
      type: string;         // "easy", "long", "tempo", "intervals", "recovery"
      distance: number;     // Distance in user's preferred unit
      duration: number;     // Duration in minutes
      pace: string;         // Target pace
      description: string;  // Workout description
      isCompleted: boolean; // Completion status
      completionData: {     // Present if workout is completed
        id: string;
        completedAt: string;
        notes?: string;
        actualDistance?: number;
        actualDuration?: number;
        actualPace?: string;
      } | null;
    }>;
  };
  userSettings: {
    goalMarathonTime: string | null;
    marathonDate: Date | null;
    distanceUnit: "MILES" | "KILOMETERS";
  };
}
```

#### Error Responses

- `NOT_FOUND`: User not found
- `PRECONDITION_FAILED`: User hasn't completed profile setup (missing goal marathon time)
- `INTERNAL_SERVER_ERROR`: Training plan generation failed

#### Example Usage

```typescript
const { data } = await trpc.training.generatePlan.useQuery({
  workoutDays: [1, 3, 6] // Monday, Wednesday, Saturday
});
```

### 2. Mark Workout Complete

**Endpoint:** `training.markWorkoutComplete`  
**Method:** `mutation`  
**Description:** Marks a specific workout as completed with optional performance data.

#### Input Schema

```typescript
{
  workoutId: string;        // Required: Format "week-day" (e.g., "1-1")
  completedAt?: string;     // ISO date string, defaults to current time
  notes?: string;           // Optional workout notes
  actualDistance?: number;  // Actual distance completed
  actualDuration?: number;  // Actual duration in minutes
  actualPace?: string;      // Actual pace achieved
}
```

#### Response Schema

```typescript
{
  success: boolean;
  completion: {
    id: string;
    workoutIdentifier: string;
    completedAt: Date;
    notes: string | null;
    actualDistance: number | null;
    actualDuration: number | null;
    actualPace: string | null;
  };
}
```

#### Error Responses

- `BAD_REQUEST`: Invalid workout ID format or workout not found in plan
- `CONFLICT`: Workout already completed
- `INTERNAL_SERVER_ERROR`: Database error

#### Example Usage

```typescript
const { data } = await trpc.training.markWorkoutComplete.useMutation({
  workoutId: "1-1",
  notes: "Felt great today!",
  actualDistance: 3.2,
  actualDuration: 25,
  actualPace: "7:48"
});
```

### 3. Mark Workout Incomplete

**Endpoint:** `training.markWorkoutIncomplete`  
**Method:** `mutation`  
**Description:** Removes completion status from a previously completed workout.

#### Input Schema

```typescript
{
  workoutId: string;  // Required: Format "week-day" (e.g., "1-1")
}
```

#### Response Schema

```typescript
{
  success: boolean;
  message: string;
}
```

#### Error Responses

- `NOT_FOUND`: Workout completion not found
- `INTERNAL_SERVER_ERROR`: Database error

#### Example Usage

```typescript
const { data } = await trpc.training.markWorkoutIncomplete.useMutation({
  workoutId: "1-1"
});
```

### 4. Get Workout Completions

**Endpoint:** `training.getWorkoutCompletions`  
**Method:** `query`  
**Description:** Retrieves all workout completions for the authenticated user.

#### Input Schema

No input parameters required.

#### Response Schema

```typescript
Array<{
  id: string;
  workoutIdentifier: string;
  completedAt: Date;
  notes: string | null;
  actualDistance: number | null;
  actualDuration: number | null;
  actualPace: string | null;
}>
```

#### Example Usage

```typescript
const { data } = await trpc.training.getWorkoutCompletions.useQuery();
```

### 5. Get Workouts for Week

**Endpoint:** `training.getWorkoutsForWeek`  
**Method:** `query`  
**Description:** Retrieves all workouts for a specific training week with completion status.

#### Input Schema

```typescript
{
  week: number;  // Required: Week number (1-16)
}
```

#### Response Schema

```typescript
{
  week: number;
  workouts: Array<{
    id: string;           // Format: "week-day"
    week: number;
    day: number;
    date: string;
    type: string;
    distance: number;
    duration: number;
    pace: string;
    description: string;
    isCompleted: boolean;
    completionData: {
      id: string;
      completedAt: string;
      notes?: string;
      actualDistance?: number;
      actualDuration?: number;
      actualPace?: string;
    } | null;
  }>;
}
```

#### Error Responses

- `BAD_REQUEST`: Invalid week number
- `NOT_FOUND`: No training plan found for user

#### Example Usage

```typescript
const { data } = await trpc.training.getWorkoutsForWeek.useQuery({
  week: 1
});
```

### 6. Get Current Week

**Endpoint:** `training.getCurrentWeek`  
**Method:** `query`  
**Description:** Determines the current training week based on the user's training plan start date.

#### Input Schema

No input parameters required.

#### Response Schema

```typescript
{
  currentWeek: number | null;  // Current week number (1-16) or null if no active plan
  totalWeeks: number;          // Total weeks in the training plan (16)
  isActive: boolean;           // Whether the training plan is currently active
}
```

#### Example Usage

```typescript
const { data } = await trpc.training.getCurrentWeek.useQuery();
```

## Data Models

### Workout Types

- `easy`: Easy-paced runs for base building
- `long`: Long runs for endurance building
- `tempo`: Tempo runs at comfortably hard pace
- `intervals`: Speed work with rest intervals
- `recovery`: Recovery runs at very easy pace

### Distance Units

- `MILES`: Imperial miles
- `KILOMETERS`: Metric kilometers

### Pace Formats

- `MIN_PER_MILE`: Minutes per mile (e.g., "7:30")
- `MIN_PER_KM`: Minutes per kilometer (e.g., "4:39")

## Caching

The training plan generation endpoint implements intelligent caching:

- **Cache Duration**: 5 minutes
- **Cache Key**: Based on user ID, preferences, marathon date, and goal time
- **Cache Invalidation**: Automatic after TTL expires or when user preferences change

## Error Handling

All endpoints follow consistent error handling patterns:

- **Authentication Errors**: `401 Unauthorized`
- **Validation Errors**: `400 Bad Request` with detailed field errors
- **Not Found Errors**: `404 Not Found`
- **Conflict Errors**: `409 Conflict` (e.g., duplicate completions)
- **Server Errors**: `500 Internal Server Error`

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended for production deployments.

## Feature Flags

### Advanced Metrics

The API supports an advanced metrics feature flag (`NEXT_PUBLIC_ENABLE_ADVANCED_METRICS`) that was previously used for additional workout tracking fields:

- `effortLevel`: Perceived effort (1-10 scale)
- `weather`: Weather conditions
- `temperature`: Temperature during workout
- `intensity`: Workout intensity rating
- `calories`: Estimated calories burned

**Note**: These fields have been removed from the current implementation to simplify the user experience. The feature flag remains available for future re-implementation if needed.

## Migration Notes

### Algorithm Simplification (Completed)
The training algorithms have been simplified to focus on core, proven methodologies:

**Removed Features:**
- Advanced training stress calculations (TSS, CTL, ATL)
- Complex physiological modeling
- Heart rate zone dependencies
- Power-based training metrics

**Current Approach:**
- Uses Jack Daniels' proven pace calculation methodology
- Simple distance progression tables
- Straightforward workout generation
- Focus on essential training principles

**Benefits:**
- More reliable and predictable training plans
- Easier to understand and follow
- Reduced complexity in codebase
- Better performance and maintainability

## Examples

### Complete Workout Flow

```typescript
// 1. Get current training week
const currentWeek = await trpc.training.getCurrentWeek.useQuery();

// 2. Get workouts for current week
const weekWorkouts = await trpc.training.getWorkoutsForWeek.useQuery({
  week: currentWeek.currentWeek || 1
});

// 3. Complete a workout
const completion = await trpc.training.markWorkoutComplete.useMutation({
  workoutId: "1-1",
  notes: "Great workout!",
  actualDistance: 3.0,
  actualDuration: 24,
  actualPace: "8:00"
});

// 4. Get updated completions
const completions = await trpc.training.getWorkoutCompletions.useQuery();
```

### Generate Training Plan

```typescript
// Generate plan with custom workout days
const trainingPlan = await trpc.training.generatePlan.useQuery({
  workoutDays: [2, 4, 7] // Tuesday, Thursday, Sunday
});

// Access workout data
trainingPlan.plan.workouts.forEach(workout => {
  console.log(`Week ${workout.week}, Day ${workout.day}: ${workout.type} - ${workout.distance} miles`);
});
```

## Support

For API support or questions, please refer to the main application documentation or contact the development team. 