# Marathon Minimalist Training App

A comprehensive marathon training application built with Next.js, providing personalized 16-week training plans and workout tracking.

## Quick Start

Docs → [https://documents.zerotoshipped.com](https://documents.zerotoshipped.com/docs/quick-start)  
Demo → https://demo.zerotoshipped.com/
ENV generator → https://env.zerotoshipped.com/

## Features

- **Personalized Training Plans**: 16-week marathon training plans based on your goals and preferences
- **Workout Tracking**: Log completed workouts with distance, duration, pace, and notes
- **Progress Monitoring**: Track your training progress week by week
- **Flexible Scheduling**: Customize workout days to fit your schedule
- **Multiple Units**: Support for both miles and kilometers
- **Pace Formats**: Choose between min/mile and min/km pace formats

## Feature Flags

The application supports several feature flags for customizing functionality:

### Training Features

- `NEXT_PUBLIC_ENABLE_ADVANCED_METRICS` (default: `false`)
  - Controls advanced workout metrics tracking
  - When enabled, allows tracking of effort level, weather, temperature, intensity, and calories
  - Currently disabled to maintain a simplified user experience
  - Can be re-enabled in the future if advanced tracking is desired

### Other Features

- `NEXT_PUBLIC_ENABLE_BLOG_PAGE` - Enable/disable blog functionality
- `NEXT_PUBLIC_ENABLE_ABOUT_PAGE` - Enable/disable about page
- `NEXT_PUBLIC_ENABLE_CHAT_PAGE` - Enable/disable chat functionality
- `NEXT_PUBLIC_ENABLE_PRICING_PAGE` - Enable/disable pricing page

## API Documentation

Comprehensive API documentation is available at:
- [Training API Documentation](./docs/api/training-api.md)

## Environment Configuration

The application uses environment variables for configuration. Key variables include:

- Authentication settings
- Email provider configuration
- Feature flags
- API keys for external services

For a complete list of environment variables, see the environment schema files in `src/env/schemas/`.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Run database migrations: `npm run db:migrate`
5. Start the development server: `npm run dev`

## Recent Changes

See [CHANGELOG.md](./CHANGELOG.md) for detailed information about recent updates, including the removal of advanced metrics to simplify the user experience.
