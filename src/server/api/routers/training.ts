import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TrainingScheduler, type ScheduledTrainingPlan } from "@/lib/training/training-scheduler";
import { userPreferencesSchema } from "@/types/user-preferences";
import { TrainingPreferences } from "@/types/training";

const generatePlanSchema = z.object({
  startDate: z.string().optional(), // ISO date string, defaults to today
  workoutDays: z.array(z.number().min(1).max(7)).optional(), // Days of week, defaults to [2,4,6] (Tue, Thu, Sat)
});

const markWorkoutCompleteSchema = z.object({
  workoutId: z.string(), // Unique identifier for the workout (week-day combination)
  completedAt: z.string().optional(), // ISO date string, defaults to now
  notes: z.string().optional(),
  actualDistance: z.number().optional(),
  actualDuration: z.number().optional(), // in minutes
  actualPace: z.string().optional(),
  effortLevel: z.number().min(1).max(10).optional(),
  weather: z.string().optional(),
  temperature: z.number().optional(),
});

export const trainingRouter = createTRPCRouter({
  generatePlan: protectedProcedure
    .input(generatePlanSchema)
    .query(async ({ ctx, input }) => {
      // Get user's marathon settings and preferences
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          goalMarathonTime: true,
          current5KTime: true,
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
      
      // Create training preferences object
      const trainingPreferences: TrainingPreferences = {
        distanceUnit: preferences.marathonDistanceUnit || "MILES",
        paceFormat: preferences.marathonPaceFormat || "MIN_PER_MILE",
        workoutDays: input.workoutDays || preferences.marathonWorkoutDays || [2, 4, 6], // Default: Tue, Thu, Sat
      };

      // Determine start date
      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      
      // Create training scheduler
      const scheduler = new TrainingScheduler({
        startDate,
        goalMarathonTime: user.goalMarathonTime || "04:00:00",
        workoutDays: input.workoutDays || [2, 4, 6],
        preferences: trainingPreferences,
      });

      try {
        // Generate the training plan
        const plan = scheduler.generateScheduledPlan();
        
        // Get workout completions for this user
        const completions = await ctx.db.workoutLog.findMany({
          where: { 
            userId: ctx.session.user.id,
            workoutIdentifier: {
              not: null, // Only get logs that have a workoutIdentifier (our custom format)
            }
          },
          select: {
            id: true,
            workoutIdentifier: true, // This contains our "week-day" format
            completedAt: true,
            notes: true,
            actualDistance: true,
            actualDuration: true,
            actualPace: true,
            effortLevel: true,
            weather: true,
            temperature: true,
          }
        });

        // Create a map of completed workouts by workoutIdentifier
        const completionMap = new Map<string, typeof completions[0]>();
        completions.forEach(completion => {
          if (completion.workoutIdentifier) {
            completionMap.set(completion.workoutIdentifier, completion);
          }
        });

        // Add completion status to workouts
        const workoutsWithCompletion = plan.workouts.map(workout => {
          const workoutId = `${workout.week}-${workout.day}`;
          const completion = completionMap.get(workoutId);
          return {
            ...workout,
            id: workoutId,
            isCompleted: !!completion,
            completionData: completion || null,
          };
        });
        
        return {
          success: true,
          plan: {
            ...plan,
            workouts: workoutsWithCompletion,
          },
          userSettings: {
            goalMarathonTime: user.goalMarathonTime,
            current5KTime: user.current5KTime,
            marathonDate: user.marathonDate,
            distanceUnit: preferences.marathonDistanceUnit,
          },
        };
      } catch (error) {
        console.error("Error generating training plan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate training plan",
        });
      }
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
            effortLevel: input.effortLevel,
            weather: input.weather,
            temperature: input.temperature,
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

  getWorkoutCompletions: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + (14 * 7 * 24 * 60 * 60 * 1000));

      const completions = await ctx.db.workoutLog.findMany({
        where: {
          userId: ctx.session.user.id,
          completedAt: {
            gte: startDate,
            lte: endDate,
          }
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
          current5KTime: true,
          marathonDate: true,
          preferences: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const preferences = userPreferencesSchema.parse(user.preferences || {});
      
      const trainingPreferences: TrainingPreferences = {
        distanceUnit: preferences.marathonDistanceUnit || "MILES",
        paceFormat: preferences.marathonPaceFormat || "MIN_PER_MILE",
        workoutDays: preferences.marathonWorkoutDays || [2, 4, 6],
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
}); 