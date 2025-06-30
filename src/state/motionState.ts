// Motion State Implementation
// Based on rac/state/motion.rac.yaml specification

import { getMotionConfig } from '../config/appConfig';

export interface MotionState {
  isAvailable: boolean;
  hasPermission: boolean;
  isMoving: boolean;
  controlMode: 'manual' | 'motion';
  magnitudeHistory: number[];
  varianceThreshold: number;
  lastStateChange: number;
  consecutiveStillCount: number; // Track consecutive "still" readings
  consecutiveMovingCount: number; // Track consecutive "moving" readings
}

const motionConfig = getMotionConfig();

export const initialMotionState: MotionState = {
  isAvailable: false,
  hasPermission: false,
  isMoving: false,
  controlMode: 'manual',
  magnitudeHistory: [],
  varianceThreshold: motionConfig.baseVarianceThreshold,
  lastStateChange: 0,
  consecutiveStillCount: 0,
  consecutiveMovingCount: 0
};

// Motion state validation functions
export const validateMotionState = (state: MotionState): boolean => {
  // Validate according to rac/logic/motion-validation.rac.yaml
  
  // Check state consistency
  if (!state.isAvailable && state.hasPermission) {
    return false; // Invalid: can't have permission without availability
  }
  
  // Validate threshold range
  if (state.varianceThreshold <= 0) {
    return false;
  }
  
  // Validate control mode
  if (!['manual', 'motion'].includes(state.controlMode)) {
    return false;
  }
  
  return true;
};

// Motion state update helpers
export const updateMotionThreshold = (
  currentState: MotionState, 
  sensitivity: number
): MotionState => {
  // Sensitivity range: 0-100, convert to threshold
  // Higher sensitivity = lower threshold
  const baseThreshold = motionConfig.baseVarianceThreshold;
  const adjustedThreshold = baseThreshold * (1 - sensitivity / 100);
  
  return {
    ...currentState,
    varianceThreshold: Math.max(motionConfig.minVarianceThreshold, adjustedThreshold)
  };
};

export const updateMotionHistory = (
  currentState: MotionState,
  magnitude: number
): MotionState => {
  const maxHistorySize = motionConfig.historySize;
  const newHistory = [...currentState.magnitudeHistory, magnitude];
  
  // Remove oldest values if history exceeds max size
  if (newHistory.length > maxHistorySize) {
    newHistory.shift();
  }
  
  return {
    ...currentState,
    magnitudeHistory: newHistory
  };
};