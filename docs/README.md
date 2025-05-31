# Marathon Minimalist Documentation

Welcome to the Marathon Minimalist Training App documentation.

## API Documentation

- [Training API](./api/training-api.md) - Complete reference for training-related endpoints

## Architecture

The application is built using:

- **Frontend**: Next.js 14 with React
- **Backend**: tRPC for type-safe API communication
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library

## Key Features

### Training Plan Generation
- Personalized 16-week marathon training plans
- Based on Jack Daniels' proven running methodology
- Uses scientifically-backed pace calculations and progressive training principles
- Intelligent caching for performance optimization

### Training Algorithm Methodology
The training plan generation is built on proven principles:

**Pace Calculations:**
- Based on Jack Daniels' VDOT methodology
- Easy pace for aerobic base building
- Tempo pace for lactate threshold development
- Interval pace for VO2 max improvement
- Long run pace for endurance building

**Training Structure:**
- 16-week progressive training plans
- Balanced workout distribution across training zones
- Simple distance progression tables
- Focus on essential training principles without over-complication

**Benefits:**
- Reliable and predictable training outcomes
- Easy to understand and follow
- Scientifically-backed approach
- Optimized for performance and maintainability

### Workout Tracking
- Simple, focused workout logging
- Core metrics: distance, duration, pace, notes
- Progress tracking and completion status

### User Preferences
- Customizable workout days
- Distance unit preferences (miles/kilometers)
- Pace format preferences (min/mile or min/km)

## Feature Flags

The application uses feature flags to control functionality:

- `NEXT_PUBLIC_ENABLE_ADVANCED_METRICS`: Controls advanced workout metrics (currently disabled)
- Various page-level flags for enabling/disabling features

## Database Schema

Key entities:
- `User`: User accounts and preferences
- `WorkoutLog`: Workout completion records
- Training plans are generated dynamically, not stored in database

## Performance Considerations

- Training plan caching (5-minute TTL)
- Optimized database queries with selective field selection
- Granular cache invalidation
- React component memoization where appropriate
- Simplified algorithms for better performance and reliability

## Recent Updates

**Algorithm Simplification (Completed):**
- Removed advanced training stress calculations and complex physiological modeling
- Simplified to focus on proven Jack Daniels methodology
- Improved performance and maintainability
- Enhanced reliability and predictability of training plans

See the [CHANGELOG](../CHANGELOG.md) for detailed recent changes. 