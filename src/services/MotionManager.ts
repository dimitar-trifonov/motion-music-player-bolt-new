// MotionManager Class - Independent Motion Detection Management (Step 1.1)
// Centralized motion detection management independent of React
// Implements complete variance-based motion detection algorithm from RaC specifications

import { MotionState } from '../state/motionState';
import { getMotionConfig } from '../config/appConfig';

export interface MotionManagerConfig {
  sensitivity?: number; // 0-100 scale
  debounceDelay?: number; // milliseconds
  historySize?: number; // number of magnitude values to keep
}

export interface MotionManagerCallbacks {
  onMotionStateChange?: (isMoving: boolean) => void;
  onPermissionChange?: (hasPermission: boolean) => void;
  onAvailabilityChange?: (isAvailable: boolean) => void;
  onError?: (error: string) => void;
}

export type StateDispatchFunction = (updates: Partial<MotionState>) => void;

export class MotionManager {
  private isInitialized = false;
  private isActive = false;
  private deviceMotionListener: ((event: DeviceMotionEvent) => void) | null = null;
  private stateDispatch: StateDispatchFunction | null = null;
  private callbacks: MotionManagerCallbacks = {};
  
  // Motion detection state
  private magnitudeHistory: number[] = [];
  private varianceThreshold: number;
  private lastStateChange = 0;
  private currentMotionState = false;
  private debounceDelay: number;
  private historySize: number;
  private consecutiveStillCount = 0;
  private consecutiveMovingCount = 0;
  
  // Control mode state
  private controlMode: 'manual' | 'motion' = 'manual';
  private isAvailable = false;
  private hasPermission = false;

  constructor(config: MotionManagerConfig = {}) {
    console.log('MotionManager: Initializing...');
    
    // Load default configuration
    const motionConfig = getMotionConfig();
    this.varianceThreshold = motionConfig.baseVarianceThreshold;
    this.debounceDelay = motionConfig.debounceDelay;
    this.historySize = motionConfig.historySize;
    
    // Apply configuration
    if (config.sensitivity !== undefined) {
      this.setSensitivity(config.sensitivity);
    }
    if (config.debounceDelay !== undefined) {
      this.debounceDelay = config.debounceDelay;
    }
    if (config.historySize !== undefined) {
      this.historySize = config.historySize;
    }
    
    this.isInitialized = true;
    console.log('MotionManager: Initialized with config:', config);
  }

  // Initialize with state dispatch function
  public initialize(stateDispatch: StateDispatchFunction): void {
    console.log('MotionManager: Setting up state dispatch integration');
    this.stateDispatch = stateDispatch;
    
    // Check device motion availability
    this.checkAvailability();
  }

  // Set callbacks for external event handling
  public setCallbacks(callbacks: MotionManagerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('MotionManager: Callbacks updated');
  }

  // Check if Device Motion API is available
  private checkAvailability(): void {
    console.log('MotionManager: Checking device motion availability...');
    
    // Check if DeviceMotionEvent is supported
    const isSupported = 'DeviceMotionEvent' in window;
    
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';
    
    this.isAvailable = isSupported && isSecureContext;
    
    console.log('MotionManager: Availability check result:', {
      isSupported,
      isSecureContext,
      isAvailable: this.isAvailable
    });
    
    // Update state
    this.updateMotionState({
      isAvailable: this.isAvailable
    });
    
    // Trigger callback
    this.callbacks.onAvailabilityChange?.(this.isAvailable);
  }

  // Request motion detection permission
  public async requestPermission(): Promise<boolean> {
    console.log('MotionManager: Requesting motion permission...');
    
    if (!this.isAvailable) {
      console.warn('MotionManager: Motion detection not available');
      this.callbacks.onError?.('Motion detection not available on this device');
      return false;
    }

    try {
      // For iOS 13+ devices, we need to request permission
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        console.log('MotionManager: Requesting iOS permission...');
        const permission = await (DeviceMotionEvent as any).requestPermission();
        this.hasPermission = permission === 'granted';
        console.log('MotionManager: iOS permission result:', permission);
      } else {
        // For other devices, permission is granted by default
        console.log('MotionManager: Permission granted by default (non-iOS)');
        this.hasPermission = true;
      }

      // Update state
      this.updateMotionState({
        hasPermission: this.hasPermission
      });

      // Trigger callback
      this.callbacks.onPermissionChange?.(this.hasPermission);

      return this.hasPermission;
    } catch (error) {
      console.error('MotionManager: Permission request failed:', error);
      this.hasPermission = false;
      
      // Update state
      this.updateMotionState({
        hasPermission: false
      });
      
      this.callbacks.onError?.(`Permission request failed: ${error}`);
      return false;
    }
  }

  // Start motion detection
  public start(): boolean {
    console.log('MotionManager: Starting motion detection...');
    
    if (!this.isAvailable || !this.hasPermission) {
      console.warn('MotionManager: Cannot start - not available or no permission');
      return false;
    }

    if (this.isActive) {
      console.log('MotionManager: Already active');
      return true;
    }

    // Create device motion listener
    this.deviceMotionListener = (event: DeviceMotionEvent) => {
      this.handleDeviceMotion(event);
    };

    // Add event listener
    window.addEventListener('devicemotion', this.deviceMotionListener);
    this.isActive = true;
    
    console.log('MotionManager: Motion detection started');
    return true;
  }

  // Stop motion detection
  public stop(): void {
    console.log('MotionManager: Stopping motion detection...');
    
    if (this.deviceMotionListener) {
      window.removeEventListener('devicemotion', this.deviceMotionListener);
      this.deviceMotionListener = null;
    }
    
    this.isActive = false;
    
    // Clear motion history
    this.magnitudeHistory = [];
    this.consecutiveStillCount = 0;
    this.consecutiveMovingCount = 0;
    
    // Update state to not moving
    this.updateMotionState({
      isMoving: false,
      magnitudeHistory: []
    });
    
    console.log('MotionManager: Motion detection stopped');
  }

  // Handle device motion events - Complete variance-based algorithm
  private handleDeviceMotion(event: DeviceMotionEvent): void {
    const acceleration = event.accelerationIncludingGravity;
    
    if (!acceleration || 
        acceleration.x === null || 
        acceleration.y === null || 
        acceleration.z === null) {
      return; // Invalid data
    }

    // Step 1: Calculate magnitude of acceleration vector
    const magnitude = Math.sqrt(
      acceleration.x * acceleration.x +
      acceleration.y * acceleration.y +
      acceleration.z * acceleration.z
    );

    // Step 2: Update magnitude history (fixed-size history)
    this.magnitudeHistory.push(magnitude);
    if (this.magnitudeHistory.length > this.historySize) {
      this.magnitudeHistory.shift(); // Remove oldest value
    }

    // Step 3: Calculate variance (need at least 2 values)
    if (this.magnitudeHistory.length < 2) {
      return; // Not enough data for variance calculation
    }

    const mean = this.magnitudeHistory.reduce((sum, val) => sum + val, 0) / this.magnitudeHistory.length;
    const variance = this.magnitudeHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.magnitudeHistory.length;

    // Step 4: Motion determination based on variance threshold
    const isCurrentlyMoving = variance > this.varianceThreshold;

    // Step 5: State debouncing to prevent rapid changes
    const currentTime = Date.now();
    const timeSinceLastChange = currentTime - this.lastStateChange;

    // Update consecutive counts for stability
    const motionConfig = getMotionConfig();
    if (isCurrentlyMoving) {
      this.consecutiveMovingCount++;
      this.consecutiveStillCount = 0;
    } else {
      this.consecutiveStillCount++;
      this.consecutiveMovingCount = 0;
    }

    // Only change state if enough time has passed and we have consistent readings
    const shouldChangeState = timeSinceLastChange >= this.debounceDelay &&
                             this.currentMotionState !== isCurrentlyMoving &&
                             (isCurrentlyMoving ? this.consecutiveMovingCount >= motionConfig.consecutiveReadingsRequired : this.consecutiveStillCount >= motionConfig.consecutiveReadingsRequired);

    if (shouldChangeState) {
      if (process.env.NODE_ENV === 'development') {
        console.log('MotionManager: Motion state change', {
          from: this.currentMotionState,
          to: isCurrentlyMoving,
          variance: variance.toFixed(3),
          threshold: this.varianceThreshold.toFixed(3)
        });
      }

      this.currentMotionState = isCurrentlyMoving;
      this.lastStateChange = currentTime;

      // Update state
      this.updateMotionState({
        isMoving: this.currentMotionState,
        lastStateChange: this.lastStateChange,
        magnitudeHistory: [...this.magnitudeHistory] // Copy array
      });

      // Trigger callback
      this.callbacks.onMotionStateChange?.(this.currentMotionState);
    }
  }


  // Set motion sensitivity (0-100 scale)
  public setSensitivity(sensitivity: number): void {
    // Validate sensitivity range
    if (sensitivity < 0 || sensitivity > 100) {
      console.warn('MotionManager: Invalid sensitivity value:', sensitivity);
      return;
    }

    const motionConfig = getMotionConfig();
    // Convert sensitivity to threshold
    // Higher sensitivity = lower threshold (more sensitive to motion)
    const baseThreshold = motionConfig.baseVarianceThreshold;
    this.varianceThreshold = baseThreshold * (1 - sensitivity / 100);
    
    // Ensure minimum threshold
    this.varianceThreshold = Math.max(motionConfig.minVarianceThreshold, this.varianceThreshold);

    console.log('MotionManager: Sensitivity updated', {
      sensitivity,
      threshold: this.varianceThreshold.toFixed(3)
    });

    // Update state
    this.updateMotionState({
      varianceThreshold: this.varianceThreshold
    });
  }

  // Switch control mode
  public setControlMode(mode: 'manual' | 'motion'): void {
    console.log('MotionManager: Switching control mode from', this.controlMode, 'to', mode);
    
    const previousMode = this.controlMode;
    this.controlMode = mode;

    // Update state
    this.updateMotionState({
      controlMode: this.controlMode
    });

    // Handle mode-specific logic
    if (mode === 'motion') {
      // Start motion detection if available and permitted
      if (this.isAvailable && this.hasPermission) {
        this.start();
      }
    } else {
      // Stop motion detection when switching to manual
      this.stop();
    }

    console.log('MotionManager: Control mode switched successfully');
  }

  // Update motion state via dispatch function
  private updateMotionState(updates: Partial<MotionState>): void {
    if (this.stateDispatch) {
      this.stateDispatch(updates);
    }
  }

  // Get current state
  public getState(): Partial<MotionState> {
    return {
      isAvailable: this.isAvailable,
      hasPermission: this.hasPermission,
      isMoving: this.currentMotionState,
      controlMode: this.controlMode,
      magnitudeHistory: [...this.magnitudeHistory],
      varianceThreshold: this.varianceThreshold,
      lastStateChange: this.lastStateChange,
      consecutiveStillCount: this.consecutiveStillCount,
      consecutiveMovingCount: this.consecutiveMovingCount
    };
  }

  // Check if motion detection is active
  public isMotionDetectionActive(): boolean {
    return this.isActive;
  }

  // Cleanup and destroy
  public destroy(): void {
    console.log('MotionManager: Destroying...');
    
    this.stop();
    this.stateDispatch = null;
    this.callbacks = {};
    this.isInitialized = false;
    
    console.log('MotionManager: Destroyed');
  }
}

// Export types for external use
export type { MotionManagerConfig, MotionManagerCallbacks, StateDispatchFunction };