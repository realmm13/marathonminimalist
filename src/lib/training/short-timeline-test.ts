import { addWeeks } from 'date-fns';
import { DistanceUnit, PaceFormat } from '../../generated/prisma';
import { TrainingPreferences } from '@/types/training';
import { 
  assessTimelineViability, 
  generateShortTimelinePlan,
  requiresShortTimelineHandling,
  getRecommendedMinimumTimeline,
  getAbsoluteMinimumTimeline
} from './short-timeline-adapter';

// Test preferences
const testPreferences: TrainingPreferences = {
  distanceUnit: DistanceUnit.MILES,
  paceFormat: PaceFormat.MIN_PER_MILE,
  workoutDays: [1, 3, 6] // Monday, Wednesday, Saturday
};

// Test goal time
const goalMarathonTime = "3:30:00"; // 3 hours 30 minutes

// Test scenarios
function testShortTimelineScenarios() {
  const startDate = new Date('2024-01-01');
  
  console.log('=== Short Timeline Adapter Test ===\n');
  
  // Test 1: 6 weeks available (minimal strategy)
  console.log('Test 1: 6 weeks available');
  const raceDate6Weeks = addWeeks(startDate, 6);
  const config6 = assessTimelineViability(startDate, raceDate6Weeks);
  console.log('Config:', config6);
  
  const plan6 = generateShortTimelinePlan(startDate, raceDate6Weeks, goalMarathonTime, testPreferences);
  console.log('Plan:', {
    weeks: plan6.weeks,
    workoutCount: plan6.workouts.length,
    warnings: plan6.warnings,
    recommendations: plan6.recommendations
  });
  console.log('\n');
  
  // Test 2: 10 weeks available (prioritize strategy)
  console.log('Test 2: 10 weeks available');
  const raceDate10Weeks = addWeeks(startDate, 10);
  const config10 = assessTimelineViability(startDate, raceDate10Weeks);
  console.log('Config:', config10);
  
  const plan10 = generateShortTimelinePlan(startDate, raceDate10Weeks, goalMarathonTime, testPreferences);
  console.log('Plan:', {
    weeks: plan10.weeks,
    workoutCount: plan10.workouts.length,
    warnings: plan10.warnings,
    recommendations: plan10.recommendations
  });
  console.log('\n');
  
  // Test 3: 12 weeks available (compress strategy)
  console.log('Test 3: 12 weeks available');
  const raceDate12Weeks = addWeeks(startDate, 12);
  const config12 = assessTimelineViability(startDate, raceDate12Weeks);
  console.log('Config:', config12);
  
  const plan12 = generateShortTimelinePlan(startDate, raceDate12Weeks, goalMarathonTime, testPreferences);
  console.log('Plan:', {
    weeks: plan12.weeks,
    workoutCount: plan12.workouts.length,
    warnings: plan12.warnings,
    recommendations: plan12.recommendations
  });
  console.log('\n');
  
  // Test 4: 3 weeks available (not viable)
  console.log('Test 4: 3 weeks available (should not be viable)');
  const raceDate3Weeks = addWeeks(startDate, 3);
  const config3 = assessTimelineViability(startDate, raceDate3Weeks);
  console.log('Config:', config3);
  
  const plan3 = generateShortTimelinePlan(startDate, raceDate3Weeks, goalMarathonTime, testPreferences);
  console.log('Plan:', {
    weeks: plan3.weeks,
    workoutCount: plan3.workouts.length,
    warnings: plan3.warnings,
    recommendations: plan3.recommendations
  });
  console.log('\n');
  
  // Test utility functions
  console.log('=== Utility Functions ===');
  console.log('Requires short timeline handling (6 weeks):', requiresShortTimelineHandling(startDate, raceDate6Weeks));
  console.log('Requires short timeline handling (14 weeks):', requiresShortTimelineHandling(startDate, addWeeks(startDate, 14)));
  console.log('Recommended minimum timeline:', getRecommendedMinimumTimeline(), 'weeks');
  console.log('Absolute minimum timeline:', getAbsoluteMinimumTimeline(), 'weeks');
}

// Export for potential use in actual tests
export { testShortTimelineScenarios }; 