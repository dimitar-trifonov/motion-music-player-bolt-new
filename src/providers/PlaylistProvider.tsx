// Updated PlaylistProvider - FIXED: Auto-Advance Race Conditions
// Eliminates callback conflicts and state update races

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Track, getTrackById, getNextTrackId, getPreviousTrackId, getFirstTrackId } from '../state/playlistState';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useAppState } from '../state/AppStateContext';

// Load playlist from JSON file
const PLAYLIST_DATA = {
  tracks: [
    {
      id: "1",
      title: "Track 1",
      artist: "Artist 1", 
      cover: "/music/track1.png",
      duration: "2:18",
      file: "/music/track1.mp3"
    },
    {
      id: "2", 
      title: "Track 2",
      artist: "Artist 2",
      cover: "/music/track2.png",
      duration: "3:10",
      file: "/music/track2.mp3"
    },
    {
      id: "3",
      title: "Track 3",
      artist: "Artist 3",
      cover: "/music/track3.png",
      duration: "3:39",
      file: "/music/track3.mp3"
    }
  ]
};

export interface PlaylistContextType {
  // Track data
  tracks: Track[];
  currentTrackId: string | null;
  currentTrack: Track | null;
  
  // Navigation
  hasNext: boolean;
  hasPrevious: boolean;
  
  // Settings
  autoAdvance: boolean;
  
  // Actions
  selectTrack: (trackId: string) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setAutoAdvance: (enabled: boolean) => void;
  
  // Events
  onTrackEnd: () => void;
  
  // Audio Engine Access
  audioEngine: ReturnType<typeof useAudioEngine>;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

interface PlaylistProviderProps {
  children: ReactNode;
}

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({ 
  children
}) => {
  console.log('PlaylistProvider: Initializing...');
  
  const [tracks] = useState<Track[]>(PLAYLIST_DATA.tracks);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvanceState] = useState(true);
  
  // Access global app state to sync player state
  const { state, dispatch } = useAppState();
  
  // PRIMARY AudioEngine initialization - happens here FIRST
  const audioEngine = useAudioEngine();
  
  console.log('PlaylistProvider: AudioEngine initialized, setting auto-advance to:', autoAdvance);

  // Get current track
  const currentTrack = currentTrackId ? getTrackById({ tracks }, currentTrackId) : null;

  // Navigation helpers
  const hasNext = currentTrackId ? getNextTrackId({ tracks }, currentTrackId) !== null : false;
  const hasPrevious = currentTrackId ? getPreviousTrackId({ tracks }, currentTrackId) !== null : false;

  // FIXED: Enhanced auto-advance logic with better state handling
  const onTrackEnd = useCallback(() => {
    console.log('PlaylistProvider: Track ended - Auto-advance analysis');
    console.log('PlaylistProvider: Current state:', {
      autoAdvance,
      currentTrackId,
      isPlaying: state.player.isPlaying,
      userPlayerMode: state.player.userPlayerMode,
      controlMode: state.player.controlMode
    });
    
    if (autoAdvance && currentTrackId) {
      const nextTrackId = getNextTrackId({ tracks }, currentTrackId);
      if (nextTrackId) {
        console.log('PlaylistProvider: Auto-advancing to next track:', nextTrackId);
        
        // CRITICAL FIX: Capture state immediately to avoid race conditions
        const wasPlaying = state.player.isPlaying;
        const userWantsToPlay = state.player.userPlayerMode === 'playing';
        const shouldContinuePlaying = wasPlaying || userWantsToPlay;
        
        console.log('PlaylistProvider: Auto-advance state capture:', {
          wasPlaying,
          userWantsToPlay,
          shouldContinuePlaying,
          controlMode: state.player.controlMode
        });
        
        // ATOMIC STATE UPDATE: Set all state changes together to prevent races
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            systemPlayerMode: 'loading',
            isPlaying: false,
            // CRITICAL: Preserve user intent for auto-advance
            userPlayerMode: shouldContinuePlaying ? 'playing' : 'paused'
          }
        });
        
        // Trigger track selection
        selectTrack(nextTrackId);
      } else {
        console.log('PlaylistProvider: No next track available, staying on current track');
      }
    } else {
      console.log('PlaylistProvider: Auto-advance disabled or no current track');
    }
  }, [autoAdvance, currentTrackId, tracks, state.player.isPlaying, state.player.userPlayerMode, state.player.controlMode, dispatch]);

  // FIXED: Improved track loading with better state coordination
  const handleTrackChange = useCallback(async (track: Track) => {
    console.log('PlaylistProvider: Loading track into audio engine:', track.title);
    
    // Set loading state
    dispatch({
      type: 'UPDATE_PLAYER_STATE',
      payload: { 
        systemPlayerMode: 'loading',
        isLoading: true 
      }
    });
    
    const success = await audioEngine.loadTrack(track.file);
    if (!success) {
      console.error('PlaylistProvider: Failed to load track:', track.title);
      dispatch({
        type: 'UPDATE_PLAYER_STATE',
        payload: { 
          systemPlayerMode: 'paused',
          isLoading: false 
        }
      });
    } else {
      console.log('PlaylistProvider: Successfully loaded track:', track.title);
      
      // ENHANCED: Better logic for determining if playback should continue
      const userWantsToPlay = state.player.userPlayerMode === 'playing';
      const inManualMode = state.player.controlMode === 'manual';
      const inMotionModeAndMoving = state.player.controlMode === 'motion' && state.motion.isMoving;
      
      const shouldContinuePlaying = userWantsToPlay && (inManualMode || inMotionModeAndMoving);
      
      console.log('PlaylistProvider: Playback decision:', {
        userWantsToPlay,
        inManualMode,
        inMotionModeAndMoving,
        shouldContinuePlaying
      });
      
      if (shouldContinuePlaying) {
        console.log('PlaylistProvider: Starting playback for loaded track');
        
        // FIXED: Use requestAnimationFrame for more reliable timing
        requestAnimationFrame(() => {
          audioEngine.play().then((success) => {
            if (success) {
              dispatch({
                type: 'UPDATE_PLAYER_STATE',
                payload: { 
                  systemPlayerMode: 'playing',
                  isPlaying: true,
                  isLoading: false 
                }
              });
            } else {
              console.error('PlaylistProvider: Failed to start playback');
              dispatch({
                type: 'UPDATE_PLAYER_STATE',
                payload: { 
                  systemPlayerMode: 'paused',
                  isLoading: false 
                }
              });
            }
          });
        });
      } else {
        console.log('PlaylistProvider: Track loaded but not starting playback');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            systemPlayerMode: 'paused',
            isLoading: false 
          }
        });
      }
    }
  }, [audioEngine, state.player.userPlayerMode, state.player.controlMode, state.motion.isMoving, dispatch]);

  // Select track
  const selectTrack = useCallback((trackId: string) => {
    const track = getTrackById({ tracks }, trackId);
    if (track) {
      console.log('PlaylistProvider: Selecting track:', track.title);
      setCurrentTrackId(trackId);
      
      // Sync with global AppState - update player's currentTrackId
      dispatch({
        type: 'UPDATE_PLAYER_STATE',
        payload: {
          currentTrackId: trackId
        }
      });
      
      handleTrackChange(track);
    } else {
      console.error('PlaylistProvider: Track not found:', trackId);
    }
  }, [tracks, handleTrackChange, dispatch]);

  // Navigate to next track
  const nextTrack = useCallback(() => {
    if (!currentTrackId) {
      // If no current track, select first track
      const firstTrackId = getFirstTrackId({ tracks });
      if (firstTrackId) {
        selectTrack(firstTrackId);
      }
      return;
    }

    const nextTrackId = getNextTrackId({ tracks }, currentTrackId);
    if (nextTrackId) {
      selectTrack(nextTrackId);
    } else {
      console.log('PlaylistProvider: No next track available');
    }
  }, [currentTrackId, tracks, selectTrack]);

  // Navigate to previous track
  const previousTrack = useCallback(() => {
    if (!currentTrackId) {
      return;
    }

    const prevTrackId = getPreviousTrackId({ tracks }, currentTrackId);
    if (prevTrackId) {
      selectTrack(prevTrackId);
    } else {
      console.log('PlaylistProvider: No previous track available');
    }
  }, [currentTrackId, tracks, selectTrack]);

  // Set auto-advance
  const setAutoAdvance = useCallback((enabled: boolean) => {
    console.log('PlaylistProvider: Setting auto-advance to:', enabled);
    setAutoAdvanceState(enabled);
  }, []);

  // FIXED: Single unified callback setup to prevent race conditions
  useEffect(() => {
    console.log('PlaylistProvider: Setting up unified AudioEngine callbacks');
    
    // CRITICAL FIX: All callbacks in one setup to prevent overwrites
    const unifiedCallbacks = {
      // AudioEngine callbacks now only handle system state
      // Manual events have exclusive control over userPlayerMode
      onPlay: () => {
        console.log('PlaylistProvider: AudioEngine onPlay - updating system state only');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            isPlaying: true,
            systemPlayerMode: 'playing'
            // REMOVED: userPlayerMode updates to prevent conflicts with manual events
          }
        });
      },
      
      onPause: () => {
        console.log('PlaylistProvider: AudioEngine onPause - updating system state only');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            isPlaying: false,
            systemPlayerMode: 'paused'
            // REMOVED: userPlayerMode updates to prevent conflicts with manual events
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
        console.log('PlaylistProvider: Duration changed to:', duration);
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { trackDuration: duration }
        });
      },
      
      onLoadStart: () => {
        console.log('PlaylistProvider: Load started');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { isLoading: true }
        });
      },
      
      onLoadEnd: () => {
        console.log('PlaylistProvider: Load ended');
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { isLoading: false }
        });
      },
      
      onEnded: () => {
        console.log('PlaylistProvider: AudioEngine onEnded - triggering auto-advance');
        // Reset current time and playing state first
        dispatch({
          type: 'UPDATE_PLAYER_STATE',
          payload: { 
            isPlaying: false,
            currentTime: 0
            // Note: userPlayerMode is preserved for auto-advance logic
          }
        });
        
        // Trigger auto-advance logic
        onTrackEnd();
      },
      
      onError: (error: string) => {
        console.error('PlaylistProvider: AudioEngine error:', error);
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
    
    // Set all callbacks at once
    audioEngine.setCallbacks?.(unifiedCallbacks);
    
    console.log('PlaylistProvider: Unified callbacks setup complete');
  }, [onTrackEnd, dispatch, audioEngine]); // Include all dependencies

  // Log when PlaylistProvider is fully ready
  useEffect(() => {
    console.log('PlaylistProvider: Fully initialized with', tracks.length, 'tracks');
  }, [tracks.length]);

  const contextValue: PlaylistContextType = {
    tracks,
    currentTrackId,
    currentTrack,
    hasNext,
    hasPrevious,
    autoAdvance,
    selectTrack,
    nextTrack,
    previousTrack,
    setAutoAdvance,
    onTrackEnd,
    audioEngine
  };

  return (
    <PlaylistContext.Provider value={contextValue}>
      {children}
    </PlaylistContext.Provider>
  );
};