// Direct test of the TrainingScheduler to see what workout data it generates
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testSchedulerDirectly() {
  try {
    console.log('🔍 Testing TrainingScheduler directly...\n');

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
      marathonDate: user.marathonDate
    });

    // Parse preferences like the API does
    const preferences = user.preferences || {
      marathonDistanceUnit: "MILES",
      marathonPaceFormat: "MIN_PER_MILE",
      marathonWorkoutDays: [1, 3, 6],
      distanceUnit: "MILES"
    };

    console.log('📊 Using preferences:', {
      distanceUnit: preferences.marathonDistanceUnit || preferences.distanceUnit,
      workoutDays: preferences.marathonWorkoutDays,
      paceFormat: preferences.marathonPaceFormat
    });

    // Create scheduler parameters like the API does
    const startDate = new Date(); // Use today as start date for testing
    const workoutDays = preferences.marathonWorkoutDays || [1, 3, 6];
    
    console.log('\n🏃 Creating TrainingScheduler with parameters:');
    console.log('  - startDate:', startDate.toISOString().split('T')[0]);
    console.log('  - raceDate:', user.marathonDate?.toISOString().split('T')[0]);
    console.log('  - goalMarathonTime:', user.goalMarathonTime);
    console.log('  - workoutDays:', workoutDays);
    console.log('  - distanceUnit:', preferences.marathonDistanceUnit || preferences.distanceUnit);

    // Import TrainingScheduler dynamically to avoid TypeScript issues
    const { TrainingScheduler } = await import('./src/lib/training/training-scheduler.ts');
    
    const scheduler = new TrainingScheduler({
      startDate,
      raceDate: user.marathonDate || undefined,
      goalMarathonTime: user.goalMarathonTime || "04:00:00",
      workoutDays: workoutDays,
      preferences: {
        distanceUnit: preferences.marathonDistanceUnit || preferences.distanceUnit || "MILES",
        paceFormat: preferences.marathonPaceFormat || "MIN_PER_MILE"
      }
    });

    console.log('\n✅ TrainingScheduler created successfully');
    
    // Generate the plan
    console.log('\n🎯 Generating training plan...');
    const plan = scheduler.generateScheduledPlan();
    
    console.log('✅ Training plan generated successfully!');
    console.log('📊 Plan summary:');
    console.log('  - Total workouts:', plan.workouts.length);
    console.log('  - Start date:', plan.startDate.toISOString().split('T')[0]);
    console.log('  - End date:', plan.endDate.toISOString().split('T')[0]);
    console.log('  - Total weeks:', plan.totalWeeks);
    
    // Check the first few workouts to see if they have distance values
    console.log('\n🔍 First 5 workouts:');
    plan.workouts.slice(0, 5).forEach((workout, index) => {
      console.log(`  ${index + 1}. Week ${workout.week}, Day ${workout.day}: ${workout.name}`);
      console.log(`     Type: ${workout.type}`);
      console.log(`     Distance: ${workout.distance}km`);
      console.log(`     Date: ${workout.scheduledDate.toISOString().split('T')[0]}`);
      console.log('');
    });

    // Check if any workouts are missing distance values
    const workoutsWithoutDistance = plan.workouts.filter(w => !w.distance);
    const workoutsWithDistance = plan.workouts.filter(w => w.distance);
    
    console.log('📈 Distance analysis:');
    console.log(`  - Workouts with distance: ${workoutsWithDistance.length}`);
    console.log(`  - Workouts without distance: ${workoutsWithoutDistance.length}`);
    
    if (workoutsWithoutDistance.length > 0) {
      console.log('\n⚠️ Workouts missing distance:');
      workoutsWithoutDistance.slice(0, 3).forEach(workout => {
        console.log(`  - Week ${workout.week}, Day ${workout.day}: ${workout.name} (${workout.type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testSchedulerDirectly().catch(console.error); 