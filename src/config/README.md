# Application Configuration System

This directory contains the centralized configuration system for the Motion Music Player application.

## Overview

All hardcoded values have been moved to a single, configurable location to improve maintainability and allow for easy customization.

## Configuration Structure

### `appConfig.ts`
The main configuration file containing all application settings:

- **Motion Detection Config**: Algorithm parameters, thresholds, timing
- **Volume Config**: Audio volume settings and limits
- **Audio Engine Config**: Audio playback configuration
- **Player Config**: Default player settings
- **Storage Config**: Local storage keys and defaults

## Usage

### Basic Usage
```typescript
import { getAppConfig, getMotionConfig } from '../config/appConfig';

// Get full configuration
const config = getAppConfig();

// Get specific section
const motionConfig = getMotionConfig();
```

### Updating Configuration
```typescript
import { updateAppConfig } from '../config/appConfig';

// Update specific values
updateAppConfig({
  motion: {
    defaultSensitivity: 75,
    debounceDelay: 300
  }
});
```

### Environment Variables

You can override default values using environment variables:

- `VITE_MOTION_SENSITIVITY`: Default motion sensitivity (0-100)
- `VITE_MOTION_DEBOUNCE_DELAY`: Motion detection debounce delay (ms)
- `VITE_DEFAULT_VOLUME`: Default volume level (0.0-1.0)

Example `.env` file:
```
VITE_MOTION_SENSITIVITY=60
VITE_MOTION_DEBOUNCE_DELAY=400
VITE_DEFAULT_VOLUME=0.8
```

## Benefits

1. **Centralized Configuration**: All settings in one place
2. **Environment Support**: Override via environment variables
3. **Type Safety**: Full TypeScript support
4. **Easy Maintenance**: No more hunting for hardcoded values
5. **Runtime Updates**: Configuration can be updated at runtime
6. **Default Fallbacks**: Sensible defaults for all values

## Migration

All previously hardcoded values have been moved to this configuration system:

- Motion detection parameters
- Volume settings and limits
- Audio engine defaults
- Player default settings
- Local storage keys and defaults

This ensures consistency across the application and makes customization much easier.