// Centralized Application Configuration
// All hardcoded values moved to a single, configurable location

export interface MotionDetectionConfig {
  // Motion detection algorithm parameters
  baseVarianceThreshold: number;
  minVarianceThreshold: number;
  debounceDelay: number;
  historySize: number;
  consecutiveReadingsRequired: number;
  defaultSensitivity: number;
}

export interface VolumeConfig {
  // Volume control parameters
  defaultLevel: number;
  minDecibels: number;
  maxDecibels: number;
  stepDecibels: number;
}

export interface AudioEngineConfig {
  // Audio engine parameters
  defaultVolume: number;
  preloadStrategy: 'none' | 'metadata' | 'auto';
}

export interface PlayerConfig {
  // Player default settings
  defaultAutoAdvance: boolean;
  defaultControlMode: 'manual' | 'motion';
}

export interface StorageConfig {
  // Local storage keys and defaults
  keys: {
    volume: string;
    autoAdvance: string;
    controlMode: string;
  };
  defaults: {
    volume: number;
    autoAdvance: boolean;
    controlMode: 'manual' | 'motion';
  };
}

// Main application configuration
export interface AppConfig {
  motion: MotionDetectionConfig;
  volume: VolumeConfig;
  audio: AudioEngineConfig;
  player: PlayerConfig;
  storage: StorageConfig;
}

// Default configuration values
export const DEFAULT_APP_CONFIG: AppConfig = {
  motion: {
    baseVarianceThreshold: 2.0,
    minVarianceThreshold: 0.1,
    debounceDelay: 1200, // milliseconds
    historySize: 15, // number of magnitude values
    consecutiveReadingsRequired: 4, // readings needed for state change
    defaultSensitivity: 50 // 0-100 scale
  },
  
  volume: {
    defaultLevel: 0.7, // 70% volume
    minDecibels: -60,
    maxDecibels: -3,
    stepDecibels: 0.1
  },
  
  audio: {
    defaultVolume: 0.7,
    preloadStrategy: 'metadata'
  },
  
  player: {
    defaultAutoAdvance: true,
    defaultControlMode: 'manual'
  },
  
  storage: {
    keys: {
      volume: 'motion-player-volume',
      autoAdvance: 'motion-player-auto-advance',
      controlMode: 'motion-player-control-mode'
    },
    defaults: {
      volume: 0.7,
      autoAdvance: true,
      controlMode: 'manual'
    }
  }
};

// Configuration getter with override support
let currentConfig: AppConfig = { ...DEFAULT_APP_CONFIG };

export const getAppConfig = (): AppConfig => {
  return currentConfig;
};

export const updateAppConfig = (updates: Partial<AppConfig>): void => {
  currentConfig = {
    ...currentConfig,
    ...updates,
    // Deep merge for nested objects
    motion: { ...currentConfig.motion, ...updates.motion },
    volume: { ...currentConfig.volume, ...updates.volume },
    audio: { ...currentConfig.audio, ...updates.audio },
    player: { ...currentConfig.player, ...updates.player },
    storage: { 
      ...currentConfig.storage, 
      ...updates.storage,
      keys: { ...currentConfig.storage.keys, ...updates.storage?.keys },
      defaults: { ...currentConfig.storage.defaults, ...updates.storage?.defaults }
    }
  };
  
  console.log('AppConfig: Configuration updated', updates);
};

export const resetAppConfig = (): void => {
  currentConfig = { ...DEFAULT_APP_CONFIG };
  console.log('AppConfig: Configuration reset to defaults');
};

// Convenience getters for specific config sections
export const getMotionConfig = (): MotionDetectionConfig => getAppConfig().motion;
export const getVolumeConfig = (): VolumeConfig => getAppConfig().volume;
export const getAudioConfig = (): AudioEngineConfig => getAppConfig().audio;
export const getPlayerConfig = (): PlayerConfig => getAppConfig().player;
export const getStorageConfig = (): StorageConfig => getAppConfig().storage;

// Environment-based configuration loading
export const loadEnvironmentConfig = (): void => {
  // Load configuration from environment variables if available
  const envConfig: Partial<AppConfig> = {};
  
  // Motion detection environment variables
  if (import.meta.env.VITE_MOTION_SENSITIVITY) {
    envConfig.motion = {
      ...DEFAULT_APP_CONFIG.motion,
      defaultSensitivity: parseInt(import.meta.env.VITE_MOTION_SENSITIVITY, 10)
    };
  }
  
  if (import.meta.env.VITE_MOTION_DEBOUNCE_DELAY) {
    envConfig.motion = {
      ...envConfig.motion || DEFAULT_APP_CONFIG.motion,
      debounceDelay: parseInt(import.meta.env.VITE_MOTION_DEBOUNCE_DELAY, 10)
    };
  }
  
  // Volume environment variables
  if (import.meta.env.VITE_DEFAULT_VOLUME) {
    const volume = parseFloat(import.meta.env.VITE_DEFAULT_VOLUME);
    envConfig.volume = {
      ...DEFAULT_APP_CONFIG.volume,
      defaultLevel: volume
    };
    envConfig.audio = {
      ...DEFAULT_APP_CONFIG.audio,
      defaultVolume: volume
    };
    envConfig.storage = {
      ...DEFAULT_APP_CONFIG.storage,
      defaults: {
        ...DEFAULT_APP_CONFIG.storage.defaults,
        volume
      }
    };
  }
  
  // Apply environment configuration
  if (Object.keys(envConfig).length > 0) {
    updateAppConfig(envConfig);
    console.log('AppConfig: Environment configuration loaded', envConfig);
  }
};

// Initialize configuration on module load
loadEnvironmentConfig();