// Debug script to check workout completions and mileage calculation
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function debugMileage() {
  try {
    console.log('🔍 Debugging mileage calculation...\n');

    // Check if there are any users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log('👥 Users found:', users.length);
    if (users.length > 0) {
      console.log('First user:', users[0]);
      
      // Check training plans for this user
      const trainingPlans = await prisma.trainingPlan.findMany({
        where: { userId: users[0].id },
        include: {
          workouts: {
            select: {
              id: true,
              name: true,
              distance: true,
              week: true,
              day: true,
              type: true,
            }
          }
        }
      });
      
      console.log('\n📋 Training Plans found:', trainingPlans.length);
      if (trainingPlans.length > 0) {
        console.log('First training plan workouts:');
        trainingPlans[0].workouts.slice(0, 5).forEach(workout => {
          console.log(`  - Week ${workout.week}, Day ${workout.day}: ${workout.name}, Distance: ${workout.distance}km`);
        });
      }
    }

    // Check workout logs
    const workoutLogs = await prisma.workoutLog.findMany({
      select: {
        id: true,
        workoutIdentifier: true,
        completedAt: true,
        actualDistance: true,
        userId: true,
      },
      orderBy: { completedAt: 'desc' }
    });
    
    console.log('\n📊 Workout Logs found:', workoutLogs.length);
    console.log('Recent workout completions:');
    workoutLogs.slice(0, 6).forEach(log => {
      console.log(`  - ID: ${log.workoutIdentifier}, Distance: ${log.actualDistance}, Completed: ${log.completedAt?.toISOString().split('T')[0]}`);
    });

    // Calculate this week's range (Monday to Sunday)
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    console.log(`\n📅 This week range: ${monday.toISOString().split('T')[0]} to ${sunday.toISOString().split('T')[0]}`);

    // Filter this week's completions
    const thisWeekCompletions = workoutLogs.filter(log => 
      log.completedAt && log.completedAt >= monday && log.completedAt <= sunday
    );

    console.log(`\n🏃 This week's completions: ${thisWeekCompletions.length}`);
    thisWeekCompletions.forEach(completion => {
      const distanceKm = completion.actualDistance || 0;
      const distanceMiles = distanceKm * 0.621371;
      console.log(`  - ${completion.workoutIdentifier}: ${distanceKm}km on ${completion.completedAt?.toISOString().split('T')[0]}`);
    });

    // Calculate total distances
    const totalDistanceKm = thisWeekCompletions.reduce((sum, completion) => sum + (completion.actualDistance || 0), 0);
    const totalDistanceMiles = totalDistanceKm * 0.621371;

    console.log(`\n🎯 Total distance this week: ${totalDistanceKm}km`);
    console.log(`🎯 Total distance this week (miles): ${totalDistanceMiles.toFixed(1)}mi`);

    // Now let's simulate what the training plan API would return
    console.log('\n🔧 Simulating training plan API call...');
    
    // Import the TrainingScheduler to see what it generates
    const { TrainingScheduler } = await import('./src/lib/training/training-scheduler.js');
    const { DistanceUnit, PaceFormat } = await import('./src/generated/prisma/index.js');
    
    const mockPreferences = {
      distanceUnit: DistanceUnit.KILOMETERS,
      paceFormat: PaceFormat.MIN_PER_KM,
      workoutDays: [2, 4, 6, 7] // Tuesday, Thursday, Saturday, Sunday
    };

    const scheduler = new TrainingScheduler({
      startDate: new Date('2024-05-27'), // Start date that would put us in week 2
      goalMarathonTime: '04:00:00',
      workoutDays: [2, 4, 6, 7],
      preferences: mockPreferences
    });

    const plan = scheduler.generateScheduledPlan();
    console.log(`Generated plan with ${plan.workouts.length} workouts`);
    
    // Show first few workouts with their distances
    console.log('\nFirst 6 workouts from generated plan:');
    plan.workouts.slice(0, 6).forEach(workout => {
      console.log(`  - Week ${workout.week}, Day ${workout.day}: ${workout.name}, Distance: ${workout.distance}km`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMileage().catch(console.error); 