-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "DistanceUnit" AS ENUM ('KILOMETERS', 'MILES');

-- CreateEnum
CREATE TYPE "PaceFormat" AS ENUM ('MIN_PER_KM', 'MIN_PER_MILE');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('TEMPO_RUN', 'INTERVAL_800M', 'LONG_RUN', 'EASY_RUN', 'RECOVERY_RUN');

-- CreateEnum
CREATE TYPE "CrossTrainingType" AS ENUM ('YOGA', 'CYCLING', 'STRENGTH_TRAINING', 'SWIMMING', 'PILATES', 'OTHER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "current5KTime" TEXT,
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "goalMarathonTime" TEXT,
ADD COLUMN     "marathonDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "training_plans" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "goalTime" TEXT,
    "workoutDays" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "WorkoutType" NOT NULL,
    "week" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION,
    "duration" INTEGER,
    "pace" TEXT,
    "intervals" JSONB,
    "trainingPlanId" TEXT NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "actualDistance" DOUBLE PRECISION,
    "actualDuration" INTEGER,
    "actualPace" TEXT,
    "effortLevel" INTEGER,
    "weather" TEXT,
    "temperature" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT,
    "trainingPlanId" TEXT,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_training_activities" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "CrossTrainingType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "intensity" INTEGER,
    "calories" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "cross_training_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_training_activities" ADD CONSTRAINT "cross_training_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
