// Volume State Implementation
// Based on rac/state/volume.rac.yaml specification

import { getVolumeConfig } from '../config/appConfig';

export interface VolumeState {
  level: number; // 0-1 range (0 = silent, 1 = maximum)
}

const volumeConfig = getVolumeConfig();

export const initialVolumeState: VolumeState = {
  level: volumeConfig.defaultLevel
};

// Volume safety limits as specified in requirements
export const VOLUME_LIMITS = {
  MIN_DB: volumeConfig.minDecibels,
  MAX_DB: volumeConfig.maxDecibels,
  STEP_DB: volumeConfig.stepDecibels
};

// Volume validation functions
export const validateVolumeLevel = (level: number): boolean => {
  return level >= 0 && level <= 1;
};

// Convert linear volume (0-1) to decibels
export const linearToDecibels = (linear: number): number => {
  if (linear <= 0) return VOLUME_LIMITS.MIN_DB;
  return 20 * Math.log10(linear);
};

// Convert decibels to linear volume (0-1)
export const decibelsToLinear = (db: number): number => {
  if (db <= VOLUME_LIMITS.MIN_DB) return 0;
  return Math.pow(10, db / 20);
};

// Apply volume safety limits
export const applySafetyLimits = (level: number): number => {
  // Clamp to 0-1 range
  const clampedLevel = Math.max(0, Math.min(1, level));
  
  // Convert to dB, apply limits, convert back
  const db = linearToDecibels(clampedLevel);
  const safeLimitedDb = Math.max(VOLUME_LIMITS.MIN_DB, Math.min(VOLUME_LIMITS.MAX_DB, db));
  
  return decibelsToLinear(safeLimitedDb);
};

// Smooth volume transition helper
export const createVolumeTransition = (
  fromLevel: number,
  toLevel: number,
  steps: number = 10
): number[] => {
  const transition: number[] = [];
  const stepSize = (toLevel - fromLevel) / steps;
  
  for (let i = 1; i <= steps; i++) {
    const level = fromLevel + (stepSize * i);
    transition.push(applySafetyLimits(level));
  }
  
  return transition;
};

// Volume state update helpers
export const updateVolumeLevel = (
  currentState: VolumeState,
  newLevel: number
): VolumeState => {
  const safeLevel = applySafetyLimits(newLevel);
  
  return {
    ...currentState,
    level: safeLevel
  };
};

// Convert volume level to percentage for UI display
export const volumeToPercentage = (level: number): number => {
  return Math.round(level * 100);
};

// Convert percentage to volume level
export const percentageToVolume = (percentage: number): number => {
  return percentage / 100;
};