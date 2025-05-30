-- AlterEnum
ALTER TYPE "WorkoutType" ADD VALUE 'MARATHON_RACE';

-- AlterTable
ALTER TABLE "workout_logs" ADD COLUMN     "workoutIdentifier" TEXT;

-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "isRaceDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "raceDetails" JSONB;
