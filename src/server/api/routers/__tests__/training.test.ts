import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { db } from '@/server/db';

// Mock the database
vi.mock('@/server/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    workoutLog: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock the training scheduler
vi.mock('@/lib/training/training-scheduler', () => ({
  TrainingScheduler: vi.fn().mockImplementation(() => ({
    generateScheduledPlan: vi.fn().mockReturnValue({
      workouts: [
        {
          id: '1-1',
          name: 'Easy Run',
          description: 'Easy pace run',
          type: 'EASY_RUN',
          week: 1,
          day: 1,
          distance: 5,
          duration: 30,
          pace: '6:00/km',
          scheduledDate: new Date('2024-01-01'),
        },
        {
          id: '1-2',
          name: 'Tempo Run',
          description: 'Comfortably hard pace',
          type: 'TEMPO_RUN',
          week: 1,
          day: 3,
          distance: 8,
          duration: 45,
          pace: '5:30/km',
          scheduledDate: new Date('2024-01-03'),
        },
      ],
    }),
  })),
}));

const createMockContext = () => {
  const mockHeaders = new Headers();
  return createTRPCContext({ headers: mockHeaders });
};

// Mock the auth session
vi.mock('@/server/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: '2024-12-31',
      }),
    },
  },
}));

describe('Training Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('markWorkoutComplete', () => {
    it('should successfully mark a workout as complete with workoutIdentifier', async () => {
      const mockWorkoutLog = {
        id: 'log-1',
        userId: 'user-1',
        workoutIdentifier: '1-1',
        completedAt: new Date('2024-01-01T10:00:00Z'),
        notes: 'Great workout!',
        actualDistance: 5.2,
        actualDuration: 32,
        actualPace: '6:10/km',
      };

      // Mock no existing completion
      (db.workoutLog.findFirst as any).mockResolvedValue(null);
      // Mock successful creation
      (db.workoutLog.create as any).mockResolvedValue(mockWorkoutLog);

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      const result = await caller.training.markWorkoutComplete({
        workoutId: '1-1',
        completedAt: '2024-01-01T10:00:00Z',
        notes: 'Great workout!',
        actualDistance: 5.2,
        actualDuration: 32,
        actualPace: '6:10/km',
      });

      expect(result.success).toBe(true);
      expect(result.workoutLog).toEqual(mockWorkoutLog);

      // Verify database calls
      expect(db.workoutLog.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          workoutIdentifier: '1-1',
        },
      });

      expect(db.workoutLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          completedAt: new Date('2024-01-01T10:00:00Z'),
          notes: 'Great workout!',
          actualDistance: 5.2,
          actualDuration: 32,
          actualPace: '6:10/km',
          workoutIdentifier: '1-1',
        },
      });
    });

    it('should throw error for invalid workout ID format', async () => {
      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      await expect(
        caller.training.markWorkoutComplete({
          workoutId: 'invalid-format',
          completedAt: '2024-01-01T10:00:00Z',
        })
      ).rejects.toThrow('Invalid workout ID format');
    });

    it('should throw error for missing week or day in workout ID', async () => {
      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      await expect(
        caller.training.markWorkoutComplete({
          workoutId: '1-',
          completedAt: '2024-01-01T10:00:00Z',
        })
      ).rejects.toThrow('Invalid workout ID format');

      await expect(
        caller.training.markWorkoutComplete({
          workoutId: '-1',
          completedAt: '2024-01-01T10:00:00Z',
        })
      ).rejects.toThrow('Invalid workout ID format');
    });

    it('should throw conflict error if workout already completed', async () => {
      const existingLog = {
        id: 'existing-log',
        userId: 'user-1',
        workoutIdentifier: '1-1',
        completedAt: new Date('2024-01-01T09:00:00Z'),
      };

      (db.workoutLog.findFirst as any).mockResolvedValue(existingLog);

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      await expect(
        caller.training.markWorkoutComplete({
          workoutId: '1-1',
          completedAt: '2024-01-01T10:00:00Z',
        })
      ).rejects.toThrow('Workout already completed');
    });

    it('should use current date if completedAt not provided', async () => {
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      (db.workoutLog.findFirst as any).mockResolvedValue(null);
      (db.workoutLog.create as any).mockResolvedValue({
        id: 'log-1',
        workoutIdentifier: '1-1',
        completedAt: mockDate,
      });

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      await caller.training.markWorkoutComplete({
        workoutId: '1-1',
      });

      expect(db.workoutLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          completedAt: mockDate,
        }),
      });

      vi.useRealTimers();
    });
  });

  describe('markWorkoutIncomplete', () => {
    it('should successfully mark a workout as incomplete', async () => {
      const existingLog = {
        id: 'log-1',
        userId: 'user-1',
        workoutIdentifier: '1-1',
        completedAt: new Date('2024-01-01T10:00:00Z'),
      };

      (db.workoutLog.findFirst as any).mockResolvedValue(existingLog);
      (db.workoutLog.delete as any).mockResolvedValue(existingLog);

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      const result = await caller.training.markWorkoutIncomplete({
        workoutId: '1-1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Workout marked as incomplete');

      // Verify database calls
      expect(db.workoutLog.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          workoutIdentifier: '1-1',
        },
      });

      expect(db.workoutLog.delete).toHaveBeenCalledWith({
        where: {
          id: 'log-1',
        },
      });
    });

    it('should throw error for invalid workout ID format', async () => {
      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      await expect(
        caller.training.markWorkoutIncomplete({
          workoutId: 'invalid',
        })
      ).rejects.toThrow('Invalid workout ID format');
    });

    it('should throw not found error if workout completion does not exist', async () => {
      (db.workoutLog.findFirst as any).mockResolvedValue(null);

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      await expect(
        caller.training.markWorkoutIncomplete({
          workoutId: '1-1',
        })
      ).rejects.toThrow('Workout completion not found');
    });
  });

  describe('getWorkoutCompletions', () => {
    it('should return workout completions for user', async () => {
      const mockCompletions = [
        {
          id: 'log-1',
          workoutIdentifier: '1-1',
          completedAt: new Date('2024-01-01T10:00:00Z'),
          notes: 'Great run!',
          actualDistance: 5.2,
          actualDuration: 32,
          actualPace: '6:10/km',
        },
        {
          id: 'log-2',
          workoutIdentifier: '1-3',
          completedAt: new Date('2024-01-03T10:00:00Z'),
          notes: 'Tough tempo',
          actualDistance: 8.1,
          actualDuration: 46,
          actualPace: '5:40/km',
        },
      ];

      (db.workoutLog.findMany as any).mockResolvedValue(mockCompletions);

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      const result = await caller.training.getWorkoutCompletions({
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      });

      expect(result.success).toBe(true);
      expect(result.completions).toEqual(mockCompletions);

      expect(db.workoutLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          completedAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-07'),
          },
        },
        select: {
          id: true,
          workoutIdentifier: true,
          completedAt: true,
          notes: true,
          actualDistance: true,
          actualDuration: true,
          actualPace: true,
        },
        orderBy: {
          completedAt: 'desc',
        },
      });
    });

    it('should use default date range if not provided', async () => {
      const mockDate = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(mockDate);

      (db.workoutLog.findMany as any).mockResolvedValue([]);

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      await caller.training.getWorkoutCompletions({});

      const expectedStartDate = new Date('2024-01-01T12:00:00Z');
      const expectedEndDate = new Date(expectedStartDate.getTime() + (14 * 7 * 24 * 60 * 60 * 1000));

      expect(db.workoutLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          completedAt: {
            gte: expectedStartDate,
            lte: expectedEndDate,
          },
        },
        select: expect.any(Object),
        orderBy: {
          completedAt: 'desc',
        },
      });

      vi.useRealTimers();
    });
  });

  describe('generatePlan', () => {
    it('should include completion data in generated plan', async () => {
      const mockUser = {
        id: 'user-1',
        goalMarathonTime: '04:00:00',
        marathonDate: new Date('2024-06-01'),
      };

      const mockCompletions = [
        {
          id: 'log-1',
          workoutIdentifier: '1-1',
          completedAt: new Date('2024-01-01T10:00:00Z'),
          notes: 'Great run!',
          actualDistance: 5.2,
          actualDuration: 32,
          actualPace: '6:10/km',
        },
      ];

      (db.user.findUnique as any).mockResolvedValue(mockUser);
      (db.workoutLog.findMany as any).mockResolvedValue(mockCompletions);

      const ctx = await createMockContext();
      const caller = createCaller(ctx);

      const result = await caller.training.generatePlan({
        startDate: '2024-01-01',
        workoutDays: [1, 3, 5, 7], // Mon, Wed, Fri, Sun
      });

      expect(result.success).toBe(true);
      expect(result.plan.workouts).toHaveLength(2);

      // Check that completion data is included
      const completedWorkout = result.plan.workouts.find((w: any) => w.id === '1-1');
      expect(completedWorkout?.isCompleted).toBe(true);
      expect(completedWorkout?.completionData).toEqual(mockCompletions[0]);

      const uncompletedWorkout = result.plan.workouts.find((w: any) => w.id === '1-2');
      expect(uncompletedWorkout?.isCompleted).toBe(false);
      expect(uncompletedWorkout?.completionData).toBeNull();
    });
  });
}); 