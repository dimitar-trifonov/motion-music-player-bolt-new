// Simplified App State Context
// Removed playlist state - now managed by PlaylistProvider

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MotionState, initialMotionState } from './motionState';
import { PlayerState, initialPlayerState } from './playerState';
import { VolumeState, initialVolumeState } from './volumeState';

// Simplified application state (no playlist)
export interface AppState {
  motion: MotionState;
  player: PlayerState;
  volume: VolumeState;
}

// Action types for state updates
export type AppAction = 
  | { type: 'UPDATE_MOTION_STATE'; payload: Partial<MotionState> }
  | { type: 'UPDATE_PLAYER_STATE'; payload: Partial<PlayerState> }
  | { type: 'UPDATE_VOLUME_STATE'; payload: Partial<VolumeState> }
  | { type: 'RESET_STATE' };

// Initial simplified state
const initialAppState: AppState = {
  motion: initialMotionState,
  player: initialPlayerState,
  volume: initialVolumeState
};

// State reducer
const appStateReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'UPDATE_MOTION_STATE':
      return {
        ...state,
        motion: { ...state.motion, ...action.payload }
      };
    
    case 'UPDATE_PLAYER_STATE':
      return {
        ...state,
        player: { ...state.player, ...action.payload }
      };
    
    case 'UPDATE_VOLUME_STATE':
      return {
        ...state,
        volume: { ...state.volume, ...action.payload }
      };
    
    case 'RESET_STATE':
      return initialAppState;
    
    default:
      return state;
  }
};

// Context creation
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialAppState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Specific state hooks for convenience
export const useMotionState = () => {
  const { state, dispatch } = useAppState();
  
  const updateMotionState = (updates: Partial<MotionState>) => {
    dispatch({ type: 'UPDATE_MOTION_STATE', payload: updates });
  };
  
  return {
    motionState: state.motion,
    updateMotionState
  };
};

export const usePlayerState = () => {
  const { state, dispatch } = useAppState();
  
  const updatePlayerState = (updates: Partial<PlayerState>) => {
    dispatch({ type: 'UPDATE_PLAYER_STATE', payload: updates });
  };
  
  return {
    playerState: state.player,
    updatePlayerState
  };
};

export const useVolumeState = () => {
  const { state, dispatch } = useAppState();
  
  const updateVolumeState = (updates: Partial<VolumeState>) => {
    dispatch({ type: 'UPDATE_VOLUME_STATE', payload: updates });
  };
  
  return {
    volumeState: state.volume,
    updateVolumeState
  };
};