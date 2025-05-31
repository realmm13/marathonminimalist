// Debug script to test tempo run generation
import { generateTempoRun } from './src/lib/training/tempo-runs.js';
import { DistanceUnit, PaceFormat } from './src/generated/prisma/index.js';

const result = generateTempoRun({
  goalMarathonTime: '3:30:00',
  week: 1,
  preferences: {
    distanceUnit: DistanceUnit.MILES,
    paceFormat: PaceFormat.MIN_PER_MILE,
    workoutDays: [1, 3, 6]
  }
});

console.log('Week 1 Tempo Run Debug:');
console.log('Tempo Distance:', result.tempoDistance);
console.log('Total Distance:', result.totalDistance);
console.log('Warm-up Distance:', result.warmUpDistance);
console.log('Cool-down Distance:', result.coolDownDistance);
console.log('Target Pace:', result.targetPace);
console.log('Description:', result.description); 