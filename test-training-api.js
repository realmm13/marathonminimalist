// Test script to check what the training API is returning
import { PrismaClient } from './src/generated/prisma/index.js';
import { TrainingScheduler } from './src/lib/training/training-scheduler.ts';

const prisma = new PrismaClient();

async function testTrainingAPI() {
  try {
    console.log('🔍 Testing training API data...\\n');

    // Get a user
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log('👤 Testing with user:', user);

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    });
    
    if (!userProfile) {
      console.log('❌ No user profile found');
      return;
    }
    
    console.log('📊 User profile:', {
      fitnessLevel: userProfile.fitnessLevel,
      weeklyMileage: userProfile.weeklyMileage,
      raceGoalTime: userProfile.raceGoalTime
    });

    // Create training scheduler
    const trainingScheduler = new TrainingScheduler();
    
    // Generate plan for current week
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // End of week
    
    console.log('📅 Generating plan for:', {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    // Generate the training plan
    const plan = trainingScheduler.generateScheduledPlan(
      startDate,
      endDate,
      userProfile.fitnessLevel,
      userProfile.weeklyMileage,
      userProfile.raceGoalTime
    );

    console.log('\\n🏃 Generated plan:', {
      totalWorkouts: plan.workouts.length,
      workoutsWithDistance: plan.workouts.filter(w => w.distance).length,
      workoutsWithoutDistance: plan.workouts.filter(w => !w.distance).length
    });

    // Show first few workouts
    console.log('\\n📋 First 3 workouts:');
    plan.workouts.slice(0, 3).forEach((workout, index) => {
      console.log(`${index + 1}. ${workout.name}:`, {
        week: workout.week,
        day: workout.day,
        distance: workout.distance,
        type: workout.type,
        description: workout.description?.substring(0, 50) + '...'
      });
    });

    // Get workout completions
    const completions = await prisma.workoutLog.findMany({
      where: { userId: user.id },
      select: {
        workoutIdentifier: true,
        completedAt: true,
        actualDistance: true,
        notes: true,
      },
    });

    console.log('\\n✅ Workout completions:', completions.length);
    completions.forEach(completion => {
      console.log(`- ${completion.workoutIdentifier}: Distance=${completion.actualDistance}km`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrainingAPI(); 