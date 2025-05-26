import { z } from "zod";
import { AI_PROVIDERS } from "@/config/ai-providers";
import { DistanceUnit, PaceFormat, ExperienceLevel } from "../generated/prisma";

// Create provider preference fields
const providerEnabledFields: Record<string, z.ZodDefault<z.ZodBoolean>> = {};
const providerKeyFields: Record<string, z.ZodOptional<z.ZodString>> = {};

// Generate preference fields for each provider
AI_PROVIDERS.forEach((provider) => {
  providerEnabledFields[`aiProviderEnabled${provider.id}`] = z
    .boolean()
    .default(false);
  providerKeyFields[`aiProviderKey${provider.id}`] = z.string().optional();
});

// Schema for all preferences
export const userPreferencesSchema = z.object({
  // General preferences
  notifications: z.boolean().default(true),
  sound: z.boolean().default(false),
  analytics: z.boolean().default(true),
  emailMarketing: z.boolean().default(true),
  emailUpdates: z.boolean().default(true),

  // Marathon Training preferences - using string literals to avoid enum loading issues
  marathonDistanceUnit: z.nativeEnum(DistanceUnit).default("MILES" as DistanceUnit),
  marathonPaceFormat: z.nativeEnum(PaceFormat).default("MIN_PER_MILE" as PaceFormat),
  marathonWorkoutDays: z.array(z.number().min(1).max(7)).default([1, 3, 6]), // Monday, Wednesday, Saturday

  // AI Provider fields (dynamically generated)
  ...providerEnabledFields,
  ...providerKeyFields,
});

// Derive types from schema
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type PreferenceKey = keyof UserPreferences;

// Extract keys from schema shape
export const preferenceKeys = Object.keys(userPreferencesSchema.shape) as Array<
  keyof typeof userPreferencesSchema.shape
>;

// Helper to create a type-safe enum from the schema
export const createSchemaEnum = <T extends z.ZodObject<any>>(schema: T) => {
  return z.enum(Object.keys(schema.shape) as [string, ...string[]]);
};

// Helper to extract the default value from the schema
export const getDefaultPreferenceValue = <K extends PreferenceKey>(
  key: K,
): UserPreferences[K] => {
  const defaultValues = userPreferencesSchema.parse({});
  return defaultValues[key];
};

// Get all default preference values as an object
export const getDefaultPreferences = (): UserPreferences => {
  return userPreferencesSchema.parse({});
};

// Schema for updating a single preference
export const updatePreferenceSchema = z.object({
  key: createSchemaEnum(userPreferencesSchema),
  value: z.union([
    z.boolean(), 
    z.string(), 
    z.number(),
    z.array(z.number()),
    z.nativeEnum(DistanceUnit),
    z.nativeEnum(PaceFormat),
    z.nativeEnum(ExperienceLevel),
    z.null()
  ]),
});

// Schema for getting a single preference
export const getSinglePreferenceSchema = z.object({
  key: createSchemaEnum(userPreferencesSchema),
  defaultValue: z.union([
    z.boolean(), 
    z.string(), 
    z.number(),
    z.array(z.number()),
    z.nativeEnum(DistanceUnit),
    z.nativeEnum(PaceFormat),
    z.nativeEnum(ExperienceLevel),
    z.null()
  ]).optional(),
});
