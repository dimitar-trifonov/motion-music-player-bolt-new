// Simplified Audio Engine Hook - FIXED: Race Condition Prevention
// AudioEngine callbacks now only handle system state, not user intent

import { useEffect, useCallback } from 'react';
import { useAppState } from '../state/AppStateContext';
import { audioEngine, AudioEngineCallbacks } from '../services/audioEngine';

export const useAudioEngine = (config?: { volume?: number }) => {
  const { state, dispatch } = useAppState();

  // FIXED: Simplified callback setup - no userPlayerMode conflicts
  const setupCallbacks = useCallback(() => {
    const callbacks: AudioEngineCallbacks = {
      // CRITICAL FIX: AudioEngine callbacks only update system state
      // Manual events have exclusive control over userPlayerMode
      onPlay: () => {
        console.log('AudioEngine: onPlay callback - system state only');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            isPlaying: true,
            systemPlayerMode: 'playing'
            // REMOVED: userPlayerMode updates to prevent race conditions
          }
        });
      },
      
      onPause: () => {
        console.log('AudioEngine: onPause callback - system state only');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            isPlaying: false,
            systemPlayerMode: 'paused'
            // REMOVED: userPlayerMode updates to prevent race conditions
          }
        });
      },
      
      onTimeUpdate: (currentTime: number) => {
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { currentTime }
        });
      },
      
      onDurationChange: (duration: number) => {
        console.log('AudioEngine: Duration changed to:', duration);
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { trackDuration: duration }
        });
      },
      
      onLoadStart: () => {
        console.log('AudioEngine: Load started');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { isLoading: true }
        });
      },
      
      onLoadEnd: () => {
        console.log('AudioEngine: Load ended');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { isLoading: false }
        });
      },
      
      onEnded: () => {
        console.log('AudioEngine: Track ended');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            isPlaying: false,
            currentTime: 0
            // Note: userPlayerMode is preserved for auto-advance logic
          }
        });
      },
      
      onError: (error: string) => {
        console.error('AudioEngine: Error -', error);
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            isPlaying: false,
            isLoading: false,
            systemPlayerMode: 'paused'
          }
        });
      }
    };

    audioEngine.setCallbacks(callbacks);
  }, [dispatch]); // Simplified dependencies - no state dependencies

  // Load track
  const loadTrack = useCallback(async (filePath: string): Promise<boolean> => {
    return await audioEngine.loadTrack(filePath);
  }, []);

  // Play audio
  const play = useCallback(async (): Promise<boolean> => {
    return await audioEngine.play();
  }, []);

  // Pause audio
  const pause = useCallback(() => {
    audioEngine.pause();
  }, []);

  // Seek to position
  const seek = useCallback((position: number) => {
    audioEngine.seek(position);
  }, []);

  // Get current state
  const getState = useCallback(() => {
    return audioEngine.getState();
  }, []);

  // Set additional callbacks (for PlaylistProvider)
  const setCallbacks = useCallback((callbacks: Partial<AudioEngineCallbacks>) => {
    audioEngine.setCallbacks(callbacks);
  }, []);

  // Setup callbacks on mount
  useEffect(() => {
    setupCallbacks();
  }, [setupCallbacks]);

  // Update volume when state changes
  useEffect(() => {
    audioEngine.setVolume(state.volume.level);
  }, [state.volume.level]);

  // Set initial volume if provided in config
  useEffect(() => {
    if (config?.volume !== undefined) {
      audioEngine.setVolume(config.volume);
    }
  }, [config?.volume]);

  return {
    loadTrack,
    play,
    pause,
    seek,
    getState,
    isInitialized: true, // Always true since we use the global singleton
    isReady: () => true, // Always ready
    setCallbacks
  };
};

// Cleanup function for app unmount
export const destroyAudioEngine = () => {
  audioEngine.destroy();
  console.log('AudioEngine: Singleton instance destroyed');
};