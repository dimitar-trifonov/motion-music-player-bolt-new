// Simplified Player State Implementation
// Removed track metadata - now handled by PlaylistProvider

export interface PlayerState {
  isPlaying: boolean;
  currentTrackId: string | null;
  isLoading: boolean;
  currentTime: number;
  trackDuration: number;
  autoAdvance: boolean;
  controlMode: 'motion' | 'manual';
  isManualControlEnabled: boolean;
  userPlayerMode: 'playing' | 'paused'; // What the user expects/selected
  systemPlayerMode: 'playing' | 'paused' | 'loading'; // Actual system state
}

export const initialPlayerState: PlayerState = {
  isPlaying: false,
  currentTrackId: null,
  isLoading: false,
  currentTime: 0,
  trackDuration: 0,
  autoAdvance: true,
  controlMode: 'manual',
  isManualControlEnabled: true,
  userPlayerMode: 'paused',
  systemPlayerMode: 'paused'
};

// Player state validation functions
export const validatePlayerState = (state: PlayerState): boolean => {
  // Validate control mode consistency
  if (state.controlMode === 'motion' && state.isManualControlEnabled) {
    return false; // Invalid: manual control should be disabled in motion mode
  }
  
  if (state.controlMode === 'manual' && !state.isManualControlEnabled) {
    return false; // Invalid: manual control should be enabled in manual mode
  }
  
  // Validate playback position
  if (state.currentTime < 0 || (state.trackDuration > 0 && state.currentTime > state.trackDuration)) {
    return false; // Invalid: current time out of bounds
  }
  
  // Validate track duration
  if (state.trackDuration < 0) {
    return false;
  }
  
  return true;
};

// Player state update helpers
export const switchControlMode = (
  currentState: PlayerState,
  mode: 'motion' | 'manual'
): PlayerState => {
  return {
    ...currentState,
    controlMode: mode,
    isManualControlEnabled: mode === 'manual'
  };
};

export const updatePlaybackPosition = (
  currentState: PlayerState,
  position: number
): PlayerState => {
  // Validate position is within track duration
  const validPosition = Math.max(0, Math.min(position, currentState.trackDuration));
  
  return {
    ...currentState,
    currentTime: validPosition
  };
};