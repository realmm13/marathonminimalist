import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getSinglePreferenceSchema,
  updatePreferenceSchema,
  userPreferencesSchema,
  type PreferenceKey,
} from "@/types/user-preferences";
import { UpdateProfileInput } from "@/types/user";
import {
  getEnhancedUser,
  getUploadThingImageConnectDisconnectArgs,
} from "@/server/db/utils";
import { z } from "zod";

// Marathon settings schema
const marathonSettingsSchema = z.object({
  distanceUnit: z.enum(["MILES", "KILOMETERS"]),
  goalMarathonTime: z.string().optional(),
  current5KTime: z.string().optional(),
  marathonDate: z.string().optional(),
  paceFormat: z.enum(["MIN_PER_MILE", "MIN_PER_KM"]).optional(),
  workoutDays: z.array(z.number().min(1).max(7)).optional(),
});

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true, // Needed for isAdmin computed by extension
        avatarImageUrl: true, // Needed for getEnhancedUser
        coverImageUrl: true, // Needed for getEnhancedUser
        avatarImage: { select: { key: true } }, // Needed for getEnhancedUser
        coverImage: { select: { key: true } }, // Needed for getEnhancedUser
        onboarded: true, // Include the onboarding status
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const enhancedUser = getEnhancedUser(user);

    return enhancedUser;
  }),

  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { preferences: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return userPreferencesSchema.parse(user.preferences || {});
  }),

  getSinglePreference: protectedProcedure
    .input(getSinglePreferenceSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { preferences: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const preferences = userPreferencesSchema.parse(user.preferences || {});
      const key = input.key as PreferenceKey;

      return {
        value:
          preferences[key] !== undefined
            ? preferences[key]
            : input.defaultValue !== undefined
              ? input.defaultValue
              : userPreferencesSchema.shape[key].parse(undefined),
      };
    }),

  updatePreference: protectedProcedure
    .input(updatePreferenceSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { preferences: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const currentPreferences = userPreferencesSchema
        .partial()
        .parse(user.preferences || {});
      const key = input.key as PreferenceKey;

      const updatedPreferences = { ...currentPreferences, [key]: input.value };

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { preferences: updatedPreferences },
      });

      return userPreferencesSchema.parse(updatedPreferences);
    }),

  getUserForEditingProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        timezone: true,
        avatarImageUrl: true,
        coverImageUrl: true,
        avatarImage: {
          select: { id: true, key: true },
        },
        coverImage: {
          select: { id: true, key: true },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      ...user,
      name: user.name ?? "",
      username: user.username ?? "",
      bio: user.bio ?? "",
      timezone: user.timezone ?? "",
      avatarImage: user.avatarImage,
      coverImage: user.coverImage,
      avatarImageUrl: user.avatarImageUrl,
      coverImageUrl: user.coverImageUrl,
    };
  }),

  getUserForSimpleProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      id: user.id,
      name: user.name ?? "",
    };
  }),

  updateProfile: protectedProcedure
    .input(UpdateProfileInput)
    .mutation(async ({ ctx, input }) => {
      // Check if the username is already taken by another user
      if (input.username) {
        console.log("input.username", input.username);
        const existingUser = await ctx.db.user.findFirst({
          where: {
            AND: [
              { username: input.username },
              { id: { not: ctx.session.user.id } },
            ],
          },
          select: { id: true }, // Only need to know if one exists
        });

        console.log("existingUser", existingUser);

        if (existingUser) {
          console.log("Username is already taken. Please choose another one.");
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username is already taken. Please choose another one.",
          });
        }
      }

      // Build update data object with only provided fields
      const updateData: any = {
        name: input.name, // name is always required
      };

      // Only include optional fields if they are explicitly provided
      if (input.username !== undefined) {
        updateData.username = input.username;
      }
      if (input.bio !== undefined) {
        updateData.bio = input.bio;
      }
      if (input.timezone !== undefined) {
        updateData.timezone = input.timezone;
      }
      if (input.avatarImage !== undefined) {
        updateData.avatarImage = getUploadThingImageConnectDisconnectArgs(
          input.avatarImage,
        );
      }
      if (input.coverImage !== undefined) {
        updateData.coverImage = getUploadThingImageConnectDisconnectArgs(
          input.coverImage,
        );
      }

      // Proceed with the update using only the provided fields
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: updateData,
      });
      return { success: true };
    }),

  markUserAsOnboarded: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { onboarded: true },
    });
    return { success: true };
  }),

  resetUserOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { onboarded: false }, // Set onboarded to false
    });
    return { success: true };
  }),

  getMarathonSettings: protectedProcedure.query(async ({ ctx }) => {
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
    
    return {
      distanceUnit: preferences.marathonDistanceUnit || "MILES",
      goalMarathonTime: user.goalMarathonTime || "",
      current5KTime: user.current5KTime || "",
      marathonDate: user.marathonDate ? user.marathonDate.toISOString().split('T')[0] : "",
    };
  }),

  updateMarathonSettings: protectedProcedure
    .input(marathonSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("Updating marathon settings for user:", ctx.session.user.id);
      console.log("Input data:", input);
      
      try {
        // Get current user preferences
        const currentUser = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { preferences: true }
        });

        const currentPreferences = userPreferencesSchema.parse(currentUser?.preferences || {});
        console.log("Current preferences:", currentPreferences);

        // Update preferences with new marathon settings
        const updatedPreferences = {
          ...currentPreferences,
          marathonDistanceUnit: input.distanceUnit,
          marathonPaceFormat: input.paceFormat || currentPreferences.marathonPaceFormat,
          marathonWorkoutDays: input.workoutDays || currentPreferences.marathonWorkoutDays,
        };
        
        console.log("Updated preferences:", updatedPreferences);

        // Update user with new marathon settings and preferences
        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            goalMarathonTime: input.goalMarathonTime,
            current5KTime: input.current5KTime,
            marathonDate: input.marathonDate ? new Date(input.marathonDate) : null,
            preferences: updatedPreferences,
          },
          select: {
            id: true,
            goalMarathonTime: true,
            current5KTime: true,
            marathonDate: true,
            preferences: true,
          },
        });

        console.log("User updated successfully:", updatedUser);

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        console.error("Error updating marathon settings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update marathon settings",
        });
      }
    }),
});
