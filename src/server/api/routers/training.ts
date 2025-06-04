import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TrainingScheduler, type ScheduledTrainingPlan } from "@/lib/training/training-scheduler";
import { userPreferencesSchema } from "@/types/user-preferences";
import { TrainingPreferences } from "@/types/training";
import { calculateStartDateFromRaceDate } from "@/lib/training/date-utils";
import { addWeeks } from "date-fns";

const generatePlanSchema = z.object({
  startDate: z.string().optional(), // ISO date string, defaults to calculated from race date
  workoutDays: z.array(z.number().min(1).max(7)).optional(), // Days of week, defaults to user preferences
});

const markWorkoutCompleteSchema = z.object({
  workoutId: z.string(), // Unique identifier for the workout (week-day combination)
  completedAt: z.string().optional(), // ISO date string, defaults to now
  notes: z.string().optional(),
  actualDistance: z.number().optional(),
  actualDuration: z.number().optional(), // in minutes
  actualPace: z.string().optional(),
});

const markWorkoutIncompleteSchema = z.object({
  workoutId: z.string(), // Unique identifier for the workout (week-day combination)
});

// Cache for training plans to avoid regeneration
const trainingPlanCache = new Map<string, { plan: ScheduledTrainingPlan; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to generate cache key
function generateCacheKey(userId: string, preferences: any, marathonDate?: Date | null, goalTime?: string | null): string {
  return `${userId}-${JSON.stringify(preferences)}-${marathonDate?.toISOString() || 'no-date'}-${goalTime || 'no-goal'}`;
}

// Helper function to check cache validity
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

export const trainingRouter = createTRPCRouter({
  generatePlan: protectedProcedure
    .input(generatePlanSchema)
    .query(async ({ ctx, input }) => {
      // Optimized user query - only select needed fields
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          goalMarathonTime: true,
          marathonDate: true,
          preferences: true,
          experienceLevel: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Parse user preferences
      const preferences = userPreferencesSchema.parse(user.preferences || {});
      const workoutDays = input.workoutDays || preferences.marathonWorkoutDays || [1, 3, 6]; // Default to Mon, Wed, Sat

      // Calculate start date if not provided
      const startDate = input.startDate 
        ? new Date(input.startDate)
        : calculateStartDateFromRaceDate(user.marathonDate!, workoutDays);

      // Calculate end date (race date)
      const endDate = user.marathonDate!;

      // Create training scheduler
      const trainingScheduler = new TrainingScheduler({
        startDate,
        raceDate: endDate,
        goalMarathonTime: user.goalMarathonTime || "04:00:00",
        workoutDays,
        preferences: {
          distanceUnit: 'KILOMETERS' as any,
          paceFormat: 'MIN_PER_KM' as any,
          workoutDays,
        }
      });

      // Generate the training plan
      const plan = trainingScheduler.generateScheduledPlan();

      // Get all workout completions for this user
      const completions = await ctx.db.workoutLog.findMany({
        where: { userId: ctx.session.user.id },
        select: {
          workoutIdentifier: true,
          completedAt: true,
          actualDistance: true,
          actualDuration: true,
          actualPace: true,
          notes: true,
        }
      });

      // Create a map for quick lookup of completion data
      const completionMap = new Map(
        completions.map(completion => [
          completion.workoutIdentifier!,
          completion
        ])
      );

      // Add completion status to workouts
      const workoutsWithCompletion = plan.workouts.map((workout): any => {
        const workoutId = `${workout.week}-${workout.day}`;
        const completion = completionMap.get(workoutId);
        return {
          ...workout,
          id: workoutId,
          isCompleted: !!completion,
          completionData: completion || null,
        };
      });

      // Cache the result
      const cacheKey = generateCacheKey(
        ctx.session.user.id,
        preferences,
        user.marathonDate,
        user.goalMarathonTime
      );
      trainingPlanCache.set(cacheKey, { plan, timestamp: Date.now() });

      return {
        success: true,
        plan: {
          ...plan,
          workouts: workoutsWithCompletion,
        },
        userSettings: {
          goalMarathonTime: user.goalMarathonTime,
          marathonDate: user.marathonDate,
          distanceUnit: preferences.marathonDistanceUnit,
        },
      };
    }),

  markWorkoutComplete: protectedProcedure
    .input(markWorkoutCompleteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse the workoutId to get week and day
        const [week, day] = input.workoutId.split('-').map(Number);
        if (!week || !day) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Invalid workout ID format. Expected 'week-day' format." 
          });
        }

        // Check if this workout is already completed by workoutIdentifier
        const existingLog = await ctx.db.workoutLog.findFirst({
          where: {
            userId: ctx.session.user.id,
            // Use the new workoutIdentifier field for our custom workout identifier
            workoutIdentifier: input.workoutId,
          }
        });

        if (existingLog) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Workout already completed"
          });
        }

        // Create the workout log entry with the workoutIdentifier
        const workoutLog = await ctx.db.workoutLog.create({
          data: {
            userId: ctx.session.user.id,
            completedAt: new Date(input.completedAt || new Date()),
            notes: input.notes,
            actualDistance: input.actualDistance,
            actualDuration: input.actualDuration,
            actualPace: input.actualPace,
            // Store the workout identifier (e.g., "1-2" for week 1, day 2)
            workoutIdentifier: input.workoutId,
          }
        });

        return {
          success: true,
          workoutLog,
        };
      } catch (error) {
        console.error("Error marking workout complete:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark workout as complete",
        });
      }
    }),

  markWorkoutIncomplete: protectedProcedure
    .input(markWorkoutIncompleteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse the workoutId to get week and day
        const [week, day] = input.workoutId.split('-').map(Number);
        if (!week || !day) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Invalid workout ID format. Expected 'week-day' format." 
          });
        }

        // Find the existing workout log by workoutIdentifier
        const existingLog = await ctx.db.workoutLog.findFirst({
          where: {
            userId: ctx.session.user.id,
            workoutIdentifier: input.workoutId,
          }
        });

        if (!existingLog) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workout completion not found"
          });
        }

        // Delete the workout log entry
        await ctx.db.workoutLog.delete({
          where: {
            id: existingLog.id,
          }
        });

        return {
          success: true,
          message: "Workout marked as incomplete",
        };
      } catch (error) {
        console.error("Error marking workout incomplete:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark workout as incomplete",
        });
      }
    }),

  getWorkoutCompletions: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + (14 * 7 * 24 * 60 * 60 * 1000));

      // Get workout completions with optimized field selection
      const completions = await ctx.db.workoutLog.findMany({
        where: {
          userId: ctx.session.user.id,
          completedAt: {
            gte: startDate,
            lte: endDate,
          }
        },
        select: {
          id: true,
          workoutIdentifier: true,
          completedAt: true,
          notes: true,
          actualDistance: true,
          actualDuration: true,
          actualPace: true,
          // Removed: effortLevel, weather, temperature (advanced metrics)
        },
        orderBy: {
          completedAt: 'desc'
        }
      });

      return {
        success: true,
        completions,
      };
    }),

  getWorkoutsForWeek: protectedProcedure
    .input(z.object({ week: z.number().min(1).max(14) }))
    .query(async ({ ctx, input }) => {
      // This would typically fetch from database, but for now we'll generate on-demand
      // In a production app, you'd want to store the generated plan and retrieve it
      
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          goalMarathonTime: true,
          marathonDate: true,
          preferences: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const preferences = userPreferencesSchema.parse(user.preferences || {});
      
      const trainingPreferences: TrainingPreferences = {
        distanceUnit: preferences.marathonDistanceUnit,
        paceFormat: preferences.marathonPaceFormat,
        workoutDays: preferences.marathonWorkoutDays,
      };

      const startDate = new Date();
      const scheduler = new TrainingScheduler({
        startDate,
        goalMarathonTime: user.goalMarathonTime || "04:00:00",
        workoutDays: [2, 4, 6],
        preferences: trainingPreferences,
      });

      try {
        const plan = scheduler.generateScheduledPlan();
        const weekWorkouts = plan.workouts.filter(workout => workout.week === input.week);
        
        return {
          success: true,
          workouts: weekWorkouts,
          week: input.week,
          totalWeeks: plan.totalWeeks,
        };
      } catch (error) {
        console.error("Error getting workouts for week:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workouts for week",
        });
      }
    }),

  getCurrentWeek: protectedProcedure.query(async ({ ctx }) => {
    // Calculate current week based on user's marathon date or training start date
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        marathonDate: true,
        createdAt: true, // Fallback to account creation date
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const now = new Date();
    let startDate: Date;

    if (user.marathonDate) {
      // Calculate start date as 14 weeks before marathon date
      startDate = new Date(user.marathonDate);
      startDate.setDate(startDate.getDate() - (14 * 7));
    } else {
      // Fallback to account creation date or current date
      startDate = user.createdAt || now;
    }

    // Calculate which week we're in (1-14)
    const timeDiff = now.getTime() - startDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const currentWeek = Math.min(Math.max(Math.floor(daysDiff / 7) + 1, 1), 14);

    return {
      currentWeek,
      startDate: startDate.toISOString(),
      marathonDate: user.marathonDate?.toISOString(),
      daysIntoProgram: daysDiff,
    };
  }),

  getTrainingPlan: protectedProcedure
    .input(z.object({
      userId: z.string(),
      raceDate: z.string().optional(),
      workoutDays: z.array(z.number()).optional(),
    }))
    .query(async ({ input }) => {
      const { userId, raceDate, workoutDays = [1, 3, 5] } = input;
      
      // Calculate start date from race date if provided
      const startDate = raceDate 
        ? calculateStartDateFromRaceDate(new Date(raceDate), workoutDays)
        : new Date();
      
      // Create scheduler with proper parameters object
      const scheduler = new TrainingScheduler({
        startDate,
        workoutDays,
        raceDate: raceDate ? new Date(raceDate) : undefined,
        preferences: {
          distanceUnit: 'KILOMETERS' as any,
          paceFormat: 'MIN_PER_KM' as any,
          workoutDays,
        }
      });
      const plan = scheduler.generateScheduledPlan();
      
      return {
        workouts: plan.workouts,
        startDate: plan.startDate.toISOString(),
        endDate: plan.endDate.toISOString(),
        raceDate: raceDate || null,
        workoutDays,
      };
    }),
}); 