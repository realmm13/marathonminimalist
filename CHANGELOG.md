# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Removed
- **Advanced Metrics Feature**: Simplified workout tracking by removing advanced metrics fields
  - Removed `effortLevel`, `weather`, `temperature`, `intensity`, and `calories` fields from workout logging
  - Updated database schema to remove unused columns from `WorkoutLog` table
  - Simplified UI components to focus on core workout data (distance, duration, pace, notes)
  - Improved API performance by optimizing database queries
  - Added feature flag `NEXT_PUBLIC_ENABLE_ADVANCED_METRICS` for potential future re-implementation

### Added
- **Feature Flag System**: Added `NEXT_PUBLIC_ENABLE_ADVANCED_METRICS` environment variable
  - Defaults to `false` (disabled)
  - Configurable via environment variables
  - Logged in application startup configuration status

### Changed
- **Performance Optimizations**: Enhanced training API performance
  - Optimized database queries to select only necessary fields
  - Improved caching strategy for training plan generation
  - Streamlined data transformation processes
  - More granular cache invalidation

### Documentation
- **API Documentation**: Added comprehensive training API documentation
  - Complete endpoint reference with input/output schemas
  - Error handling documentation
  - Usage examples and best practices
  - Migration notes for advanced metrics removal

## Previous Releases

<!-- Add previous release notes here as they become available --> 