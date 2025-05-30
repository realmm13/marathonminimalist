/*
  Warnings:

  - You are about to drop the column `calories` on the `cross_training_activities` table. All the data in the column will be lost.
  - You are about to drop the column `intensity` on the `cross_training_activities` table. All the data in the column will be lost.
  - You are about to drop the column `effortLevel` on the `workout_logs` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `workout_logs` table. All the data in the column will be lost.
  - You are about to drop the column `weather` on the `workout_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cross_training_activities" DROP COLUMN "calories",
DROP COLUMN "intensity";

-- AlterTable
ALTER TABLE "workout_logs" DROP COLUMN "effortLevel",
DROP COLUMN "temperature",
DROP COLUMN "weather";
