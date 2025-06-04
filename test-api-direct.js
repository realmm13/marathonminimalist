// Direct test of what the training API returns
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testAPIDirectly() {
  try {
    console.log('🔍 Testing training API directly...\n');

    // Get a user
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, goalMarathonTime: true, marathonDate: true, preferences: true }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log('👤 Testing with user:', {
      id: user.id,
      email: user.email,
      goalMarathonTime: user.goalMarathonTime,
      marathonDate: user.marathonDate,
      preferences: user.preferences
    });

    // Simulate what the training API does
    console.log('\n🔧 Simulating training API logic...');
    
    // Check if user has goal time (required for training plan)
    if (!user.goalMarathonTime) {
      console.log('❌ User has no goal marathon time set');
      return;
    }
    
    // Parse preferences
    let preferences;
    try {
      preferences = user.preferences || {};
      console.log('📊 User preferences:', preferences);
    } catch (error) {
      console.log('⚠️ Error parsing preferences, using defaults');
      preferences = {
        marathonDistanceUnit: "MILES",
        marathonPaceFormat: "MIN_PER_MILE",
        marathonWorkoutDays: [1, 3, 6]
      };
    }

    // Get workout completions
    const completions = await prisma.workoutLog.findMany({
      where: { 
        userId: user.id,
        workoutIdentifier: { not: null }
      },
      select: {
        workoutIdentifier: true,
        completedAt: true,
        actualDistance: true,
      }
    });

    console.log('\n✅ Workout completions found:', completions.length);
    completions.forEach(completion => {
      console.log(`  - ${completion.workoutIdentifier}: Distance=${completion.actualDistance}km, Completed=${completion.completedAt?.toISOString().split('T')[0]}`);
    });

    // Create completion map like the API does
    const completionMap = new Map();
    completions.forEach(completion => {
      if (completion.workoutIdentifier) {
        completionMap.set(completion.workoutIdentifier, completion);
      }
    });

    console.log('\n🗺️ Completion map created with', completionMap.size, 'entries');

    // Now let's see what happens when we try to create a TrainingScheduler
    console.log('\n🏃 Testing TrainingScheduler creation...');
    
    // We need to import the TrainingScheduler properly
    // Let's check what parameters it expects
    console.log('TrainingScheduler requires specific parameters. Let me check the constructor...');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIDirectly().catch(console.error); 