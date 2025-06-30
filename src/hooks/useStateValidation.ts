// State Validation Hook (Step 0.3)
// Motion state validation simplified, motion detection validation removed

import { useEffect } from 'react';
import { validateMotionState, MotionState } from '../state/motionState';
import { validatePlayerState, PlayerState } from '../state/playerState';
import { validatePlaylist, PlaylistState } from '../state/playlistState';
import { validateVolumeLevel, VolumeState } from '../state/volumeState';

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// Motion state validation hook (simplified - no motion detection logic)
export const useMotionStateValidation = (motionState: MotionState) => {
  useEffect(() => {
    const isValid = validateMotionState(motionState);
    
    if (!isValid) {
      console.warn('Motion state validation failed:', motionState);
      
      // Log specific validation errors (simplified)
      if (motionState.varianceThreshold <= 0) {
        console.error('Invalid motion state: Variance threshold must be positive');
      }
      
      if (!['manual', 'motion'].includes(motionState.controlMode)) {
        console.error('Invalid motion state: Control mode must be manual or motion');
      }
    }
  }, [motionState]);
};

// Player state validation hook
export const usePlayerStateValidation = (playerState: PlayerState) => {
  useEffect(() => {
    const isValid = validatePlayerState(playerState);
    
    if (!isValid) {
      console.warn('Player state validation failed:', playerState);
      
      // Log specific validation errors
      if (playerState.controlMode === 'motion' && playerState.isManualControlEnabled) {
        console.error('Invalid player state: Manual control should be disabled in motion mode');
      }
      
      if (playerState.controlMode === 'manual' && !playerState.isManualControlEnabled) {
        console.error('Invalid player state: Manual control should be enabled in manual mode');
      }
      
      if (playerState.currentTime < 0 || 
          (playerState.trackDuration > 0 && playerState.currentTime > playerState.trackDuration)) {
        console.error('Invalid player state: Current time out of bounds');
      }
      
      if (playerState.trackDuration < 0) {
        console.error('Invalid player state: Track duration cannot be negative');
      }
    }
  }, [playerState]);
};

// Volume state validation hook
export const useVolumeStateValidation = (volumeState: VolumeState) => {
  useEffect(() => {
    const isValid = validateVolumeLevel(volumeState.level);
    
    if (!isValid) {
      console.warn('Volume state validation failed:', volumeState);
      console.error('Invalid volume state: Level must be between 0 and 1');
    }
  }, [volumeState]);
};

// Playlist state validation hook
export const usePlaylistStateValidation = (playlistState: PlaylistState) => {
  useEffect(() => {
    const isValid = validatePlaylist(playlistState);
    
    if (!isValid) {
      console.warn('Playlist state validation failed:', playlistState);
      
      if (!playlistState.tracks || playlistState.tracks.length === 0) {
        console.error('Invalid playlist state: Playlist must have tracks');
      } else {
        // Check individual tracks
        playlistState.tracks.forEach((track, index) => {
          if (!track.id || !track.title || !track.artist || !track.duration || !track.file) {
            console.error(`Invalid track at index ${index}: Missing required fields`, track);
          }
        });
      }
    }
  }, [playlistState]);
};

// Combined validation hook for all states (motion detection validation removed)
export const useAppStateValidation = (
  motionState: MotionState,
  playerState: PlayerState,
  playlistState: PlaylistState,
  volumeState: VolumeState
) => {
  useMotionStateValidation(motionState);
  usePlayerStateValidation(playerState);
  usePlaylistStateValidation(playlistState);
  useVolumeStateValidation(volumeState);
};