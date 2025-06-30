// Global Motion Manager Instance - Singleton Pattern (Step 1.2)
// Provides singleton instance for global access with initialization helpers

import { MotionManager, MotionManagerConfig, MotionManagerCallbacks, StateDispatchFunction } from './MotionManager';
import { MotionState } from '../state/motionState';

// Global singleton instance
let globalMotionManagerInstance: MotionManager | null = null;

// Initialization state
let isGloballyInitialized = false;

// Create or get the global MotionManager instance
export const getGlobalMotionManager = (config?: MotionManagerConfig): MotionManager => {
  if (!globalMotionManagerInstance) {
    console.log('GlobalMotionManager: Creating new singleton instance');
    globalMotionManagerInstance = new MotionManager(config);
  }
  return globalMotionManagerInstance;
};

// Initialize the global motion manager with state dispatch
export const initializeGlobalMotionManager = (
  stateDispatch: StateDispatchFunction,
  config?: MotionManagerConfig,
  callbacks?: MotionManagerCallbacks
): MotionManager => {
  console.log('GlobalMotionManager: Initializing global instance...');
  
  // Get or create the singleton instance
  const motionManager = getGlobalMotionManager(config);
  
  // Initialize with state dispatch
  motionManager.initialize(stateDispatch);
  
  // Set callbacks if provided
  if (callbacks) {
    motionManager.setCallbacks(callbacks);
  }
  
  isGloballyInitialized = true;
  console.log('GlobalMotionManager: Global initialization complete');
  
  return motionManager;
};

// Check if the global motion manager is initialized
export const isGlobalMotionManagerInitialized = (): boolean => {
  return isGloballyInitialized && globalMotionManagerInstance !== null;
};

// Convenience functions for common operations
export const globalMotionManager = {
  // Get the instance (throws if not initialized)
  getInstance: (): MotionManager => {
    if (!globalMotionManagerInstance || !isGloballyInitialized) {
      throw new Error('GlobalMotionManager: Instance not initialized. Call initializeGlobalMotionManager first.');
    }
    return globalMotionManagerInstance;
  },

  // Safe get instance (returns null if not initialized)
  getSafeInstance: (): MotionManager | null => {
    return isGloballyInitialized ? globalMotionManagerInstance : null;
  },

  // Request permission
  requestPermission: async (): Promise<boolean> => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      console.warn('GlobalMotionManager: Cannot request permission - not initialized');
      return false;
    }
    return await instance.requestPermission();
  },

  // Start motion detection
  start: (): boolean => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      console.warn('GlobalMotionManager: Cannot start - not initialized');
      return false;
    }
    return instance.start();
  },

  // Stop motion detection
  stop: (): void => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      console.warn('GlobalMotionManager: Cannot stop - not initialized');
      return;
    }
    instance.stop();
  },

  // Set sensitivity
  setSensitivity: (sensitivity: number): void => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      console.warn('GlobalMotionManager: Cannot set sensitivity - not initialized');
      return;
    }
    instance.setSensitivity(sensitivity);
  },

  // Set control mode
  setControlMode: (mode: 'manual' | 'motion'): void => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      console.warn('GlobalMotionManager: Cannot set control mode - not initialized');
      return;
    }
    instance.setControlMode(mode);
  },

  // Get current state
  getState: (): Partial<MotionState> | null => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      console.warn('GlobalMotionManager: Cannot get state - not initialized');
      return null;
    }
    return instance.getState();
  },

  // Check if motion detection is active
  isActive: (): boolean => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      return false;
    }
    return instance.isMotionDetectionActive();
  },

  // Set callbacks
  setCallbacks: (callbacks: MotionManagerCallbacks): void => {
    const instance = globalMotionManager.getSafeInstance();
    if (!instance) {
      console.warn('GlobalMotionManager: Cannot set callbacks - not initialized');
      return;
    }
    instance.setCallbacks(callbacks);
  }
};

// Cleanup function for app unmount
export const destroyGlobalMotionManager = (): void => {
  console.log('GlobalMotionManager: Destroying global instance...');
  
  if (globalMotionManagerInstance) {
    globalMotionManagerInstance.destroy();
    globalMotionManagerInstance = null;
  }
  
  isGloballyInitialized = false;
  console.log('GlobalMotionManager: Global instance destroyed');
};

// Type exports for external use
export type {
  MotionManager,
  MotionManagerConfig,
  MotionManagerCallbacks,
  StateDispatchFunction
} from './MotionManager';

export type { MotionState } from '../state/motionState';

// Default export for convenience
export default globalMotionManager;