// Event System Hook - Cleaned Up (Step 5.1)
// Removed motion event placeholders and optimized player events

import { useCallback } from 'react';
import { useAppState } from '../state/AppStateContext';
import { usePlaylist } from '../providers/PlaylistProvider';

export const useEventSystem = () => {
  const { state, dispatch } = useAppState();
  const { audioEngine } = usePlaylist();

  // Validation helper (minimal logging)
  const validateAndLog = useCallback((eventType: string) => {
    if (process.env.NODE_ENV === 'development' && 
        !eventType.includes('device-motion') && 
        !eventType.includes('player-start') && 
        !eventType.includes('player-stop')) {
      console.log(`Event: ${eventType}`);
    }
    return true;
  }, []);

  // Player Events (streamlined - removed duplicated handlers)
  const playerEvents = {
    startPlayback: useCallback((motionDetected: boolean = false) => {
      const isValid = validateAndLog('player-start');
      if (!isValid || state.player.isLoading) return false;

      audioEngine.play();
      return true;
    }, [state.player.isLoading, validateAndLog, audioEngine]),

    stopPlayback: useCallback((motionStopped: boolean = false) => {
      const isValid = validateAndLog('player-stop');
      if (!isValid) return false;

      audioEngine.pause();
      return true;
    }, [validateAndLog, audioEngine]),

    // FIXED: Manual events now update userPlayerMode for proper auto-advance
    manualPlay: useCallback(() => {
      const isValid = validateAndLog('manual-play');
      if (!isValid) return false;

      console.log('useEventSystem: Manual play - updating userPlayerMode to playing');
      
      // CRITICAL FIX: Update userPlayerMode to indicate user wants to play
      // This ensures auto-advance works correctly in manual mode
      dispatch({
        type: 'UPDATE_PLAYER_STATE',
        payload: {
          userPlayerMode: 'playing'
        }
      });
      
      audioEngine.play();
      return true;
    }, [validateAndLog, audioEngine, dispatch]),

    manualPause: useCallback(() => {
      const isValid = validateAndLog('manual-pause');
      if (!isValid) return false;

      console.log('useEventSystem: Manual pause - updating userPlayerMode to paused');
      
      // CRITICAL FIX: Update userPlayerMode to indicate user wants to pause
      // This ensures auto-advance respects user's pause intent
      dispatch({
        type: 'UPDATE_PLAYER_STATE',
        payload: {
          userPlayerMode: 'paused'
        }
      });
      
      audioEngine.pause();
      return true;
    }, [validateAndLog, audioEngine, dispatch])
  };

  return {
    playerEvents,
    state,
    validateEvent: validateAndLog
  };
};