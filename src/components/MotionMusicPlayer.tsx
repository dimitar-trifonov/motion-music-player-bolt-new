// Main Motion Music Player Component - Fixed Motion-Based Playback Control
// Ensure motion state changes trigger proper playback control

import React, { useEffect, useCallback } from 'react';
import { useAppState } from '../state/AppStateContext';
import { usePlaylist } from '../providers/PlaylistProvider';
import { useAppStateValidation } from '../hooks/useStateValidation';
import { useEventSystem } from '../hooks/useEventSystem';
import { usePageVisibility } from '../hooks/usePageVisibility';
import { 
  usePersistedVolume, 
  usePersistedAutoAdvance
} from '../hooks/useLocalStorage';
import { getMotionConfig } from '../config/appConfig';

// Import MotionManager integration
import { 
  initializeGlobalMotionManager, 
  globalMotionManager,
  destroyGlobalMotionManager,
  MotionManagerCallbacks 
} from '../services/globalMotionManager';

// Import components
import MotionStatus from './MotionStatus';
import PlayerStatus from './PlayerStatus';
import PlayerControls from './PlayerControls';

const MotionMusicPlayer: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { 
    tracks, 
    currentTrack, 
    selectTrack, 
    setAutoAdvance,
    audioEngine
  } = usePlaylist();

  // Persistent settings
  const [persistedVolume, setPersistedVolume] = usePersistedVolume();
  const [persistedAutoAdvance, setPersistedAutoAdvance] = usePersistedAutoAdvance();

  // Event system for player control
  const { playerEvents } = useEventSystem();

  // Page visibility handling for audio pause/resume
  const handlePageVisibilityChange = useCallback((isVisible: boolean) => {
    console.log('MotionMusicPlayer: Page visibility changed:', isVisible);
    
    if (!isVisible) {
      // Tab lost focus - always pause audio
      if (state.player.isPlaying) {
        console.log('MotionMusicPlayer: Pausing audio due to tab losing focus');
        audioEngine.pause();
      }
    } else {
      // Tab regained focus - restore based on user intention and control mode
      const shouldRestore = state.player.userPlayerMode === 'playing';
      const inManualMode = state.player.controlMode === 'manual';
      const inMotionModeAndMoving = state.player.controlMode === 'motion' && state.motion.isMoving;
      
      const canRestore = shouldRestore && (inManualMode || inMotionModeAndMoving);
      
      console.log('MotionMusicPlayer: Tab regained focus', {
        shouldRestore,
        inManualMode,
        inMotionModeAndMoving,
        canRestore,
        userPlayerMode: state.player.userPlayerMode,
        controlMode: state.player.controlMode,
        isMoving: state.motion.isMoving
      });
      
      if (canRestore && !state.player.isPlaying && !state.player.isLoading && currentTrack) {
        console.log('MotionMusicPlayer: Restoring audio playback after tab focus');
        audioEngine.play();
      }
    }
  }, [
    state.player.isPlaying,
    state.player.userPlayerMode,
    state.player.controlMode,
    state.player.isLoading,
    state.motion.isMoving,
    currentTrack,
    audioEngine
  ]);

  // Initialize page visibility handling
  usePageVisibility(handlePageVisibilityChange);

  // State validation (only in development)
  if (process.env.NODE_ENV === 'development') {
    useAppStateValidation(
      state.motion,
      state.player,
      { tracks }, // Pass playlist data for validation
      state.volume
    );
  }

  // Create state dispatch function for MotionManager
  const motionStateDispatch = useCallback((updates: Partial<typeof state.motion>) => {
    console.log('MotionMusicPlayer: MotionManager state update:', updates);
    dispatch({
      type: 'UPDATE_MOTION_STATE',
      payload: updates
    });
  }, [dispatch]);

  // Handle motion-based player control - FIXED VERSION
  const handleMotionPlayerControl = useCallback((isMoving: boolean) => {
    console.log('MotionMusicPlayer: Motion state changed to:', isMoving, {
      controlMode: state.player.controlMode,
      currentTrack: currentTrack?.title,
      isPlaying: state.player.isPlaying,
      isLoading: state.player.isLoading
    });

    // Only handle motion-based playback in motion mode
    if (state.player.controlMode !== 'motion') {
      console.log('MotionMusicPlayer: Ignoring motion - not in motion mode');
      return;
    }

    // Only proceed if we have a current track
    if (!currentTrack) {
      console.log('MotionMusicPlayer: Ignoring motion - no current track');
      return;
    }

    // Don't interfere while loading
    if (state.player.isLoading) {
      console.log('MotionMusicPlayer: Ignoring motion - track is loading');
      return;
    }

    // Motion detected and not currently playing - start playback
    if (isMoving && !state.player.isPlaying) {
      console.log('MotionMusicPlayer: Starting playback due to motion');
      playerEvents.startPlayback(true); // true indicates motion-triggered
    }
    
    // Motion stopped and currently playing - pause playback
    if (!isMoving && state.player.isPlaying) {
      console.log('MotionMusicPlayer: Pausing playback due to motion stop');
      playerEvents.stopPlayback(true); // true indicates motion-triggered
    }
  }, [
    state.player.controlMode,
    state.player.isPlaying,
    state.player.isLoading,
    currentTrack,
    playerEvents
  ]);

  // CRITICAL: React to motion state changes from AppState
  useEffect(() => {
    console.log('MotionMusicPlayer: Motion state effect triggered', {
      isMoving: state.motion.isMoving,
      controlMode: state.player.controlMode,
      hasTrack: !!currentTrack
    });

    // Handle motion state changes for playback control
    handleMotionPlayerControl(state.motion.isMoving);
  }, [
    state.motion.isMoving, // React to motion state changes
    handleMotionPlayerControl
  ]);

  // Initialize MotionManager with callbacks
  const initializeMotionManager = useCallback(() => {
    console.log('MotionMusicPlayer: Initializing MotionManager...');
    
    const motionConfig = getMotionConfig();

    // Define MotionManager callbacks
    const motionCallbacks: MotionManagerCallbacks = {
      onMotionStateChange: (isMoving: boolean) => {
        console.log('MotionMusicPlayer: MotionManager callback - Motion state changed:', isMoving);
        // The motion state will be updated via motionStateDispatch
        // and the useEffect above will handle the playback control
      },
      
      onPermissionChange: (hasPermission: boolean) => {
        console.log('MotionMusicPlayer: Permission changed:', hasPermission);
        // Permission changes are already handled by state dispatch
      },
      
      onAvailabilityChange: (isAvailable: boolean) => {
        console.log('MotionMusicPlayer: Availability changed:', isAvailable);
        // Availability changes are already handled by state dispatch
      },
      
      onError: (error: string) => {
        console.error('MotionMusicPlayer: MotionManager error:', error);
        // Handle motion detection errors
        dispatch({
          type: 'UPDATE_MOTION_STATE',
          payload: { 
            isAvailable: false,
            hasPermission: false,
            isMoving: false
          }
        });
      }
    };

    // Initialize global MotionManager with state dispatch and callbacks
    const motionManager = initializeGlobalMotionManager(
      motionStateDispatch,
      {
        sensitivity: motionConfig.defaultSensitivity,
        debounceDelay: motionConfig.debounceDelay,
        historySize: motionConfig.historySize
      },
      motionCallbacks
    );

    console.log('MotionMusicPlayer: MotionManager initialized successfully');
    return motionManager;
  }, [motionStateDispatch, dispatch]);

  // Handle control mode changes from UI
  const handleControlModeChange = useCallback((newMode: 'manual' | 'motion') => {
    console.log('MotionMusicPlayer: Control mode change requested:', newMode);
    
    // Update MotionManager control mode
    globalMotionManager.setControlMode(newMode);
    
    // Update player state
    dispatch({
      type: 'UPDATE_PLAYER_STATE',
      payload: {
        controlMode: newMode,
        isManualControlEnabled: newMode === 'manual'
      }
    });

    // If switching to motion mode and we have permission, start motion detection
    if (newMode === 'motion' && state.motion.hasPermission) {
      console.log('MotionMusicPlayer: Starting motion detection for motion mode');
      globalMotionManager.start();
    }
  }, [dispatch, state.motion.hasPermission]);

  // Initialize app and MotionManager
  const initializeApp = useCallback(async () => {
    console.log('MotionMusicPlayer: Starting initialization...');
    
    // Restore volume setting
    dispatch({
      type: 'UPDATE_VOLUME_STATE',
      payload: { level: persistedVolume }
    });

    // Restore player settings
    dispatch({
      type: 'UPDATE_PLAYER_STATE',
      payload: { 
        autoAdvance: persistedAutoAdvance,
        controlMode: 'manual', // Start in manual mode
        isManualControlEnabled: true
      }
    });

    // Initialize MotionManager
    const motionManager = initializeMotionManager();

    // Set initial motion state based on MotionManager
    const motionState = motionManager.getState();
    dispatch({
      type: 'UPDATE_MOTION_STATE',
      payload: {
        ...motionState,
        controlMode: 'manual' // Start in manual mode
      }
    });

    // Restore playlist settings
    setAutoAdvance(persistedAutoAdvance);

    console.log('MotionMusicPlayer: Initialization complete');
  }, [
    dispatch, 
    persistedVolume, 
    persistedAutoAdvance,
    setAutoAdvance,
    initializeMotionManager
  ]);

  // Separate effect for loading default track after playlist is ready
  useEffect(() => {
    if (tracks.length > 0 && !currentTrack) {
      console.log('MotionMusicPlayer: Loading default first track:', tracks[0].title);
      selectTrack(tracks[0].id);
    }
  }, [tracks, currentTrack, selectTrack]);

  // Initialize on mount only
  useEffect(() => {
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      console.log('MotionMusicPlayer: Cleaning up MotionManager...');
      destroyGlobalMotionManager();
    };
  }, []); // Empty dependency array - only run on mount

  // Handle control mode changes from state
  useEffect(() => {
    const currentMode = state.player.controlMode;
    const motionManagerMode = globalMotionManager.getSafeInstance()?.getState()?.controlMode;
    
    // Sync MotionManager with player state if they differ
    if (motionManagerMode && motionManagerMode !== currentMode) {
      console.log('MotionMusicPlayer: Syncing control mode with MotionManager');
      globalMotionManager.setControlMode(currentMode);
    }
  }, [state.player.controlMode]);

  // Persist settings when they change
  useEffect(() => {
    setPersistedVolume(state.volume.level);
  }, [state.volume.level, setPersistedVolume]);

  useEffect(() => {
    setPersistedAutoAdvance(state.player.autoAdvance);
  }, [state.player.autoAdvance, setPersistedAutoAdvance]);

  // Log motion state changes for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('MotionMusicPlayer: Motion state changed', {
        isMoving: state.motion.isMoving,
        controlMode: state.motion.controlMode,
        isAvailable: state.motion.isAvailable,
        hasPermission: state.motion.hasPermission
      });
    }
  }, [
    state.motion.isMoving,
    state.motion.controlMode,
    state.motion.isAvailable,
    state.motion.hasPermission
  ]);

  // Log player state changes for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('MotionMusicPlayer: Player state changed', {
        isPlaying: state.player.isPlaying,
        controlMode: state.player.controlMode,
        isManualControlEnabled: state.player.isManualControlEnabled,
        currentTrackId: state.player.currentTrackId
      });
    }
  }, [
    state.player.isPlaying,
    state.player.controlMode,
    state.player.isManualControlEnabled,
    state.player.currentTrackId
  ]);

  return (
    <div className="app-container">
      {/* Motion Status Section - Now connected to MotionManager */}
      <MotionStatus onControlModeChange={handleControlModeChange} />

      {/* Player Status Section */}
      <PlayerStatus />

      {/* Player Controls Section */}
      <PlayerControls onControlModeChange={handleControlModeChange} />
    </div>
  );
};

export default MotionMusicPlayer;