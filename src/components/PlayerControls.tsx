// Player Controls Component - Manual Mode Only (Step 0.6)
// Step 2.2: Updated for direct state access while preserving manual mode functionality

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Shuffle,
  Settings,
  Hand,
  Activity
} from 'lucide-react';
import { useAppState } from '../state/AppStateContext';
import { usePlaylist } from '../providers/PlaylistProvider';
import { useEventSystem } from '../hooks/useEventSystem';
import { secondsToDuration } from '../state/playlistState';
import { volumeToPercentage, percentageToVolume } from '../state/volumeState';

interface PlayerControlsProps {
  onControlModeChange?: (mode: 'manual' | 'motion') => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ onControlModeChange }) => {
  const { state, dispatch } = useAppState();
  const { 
    tracks, 
    currentTrack, 
    hasNext, 
    hasPrevious, 
    autoAdvance,
    selectTrack, 
    nextTrack, 
    previousTrack, 
    setAutoAdvance,
    audioEngine
  } = usePlaylist();
  const { playerEvents } = useEventSystem();
  const { player, volume, motion } = state;
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle play/pause - Direct state access with manual mode validation
  const handlePlayPause = () => {
    // Validate control mode using direct state access
    if (player.controlMode !== 'manual' || !player.isManualControlEnabled) {
      console.log('PlayerControls: Play/pause only available in manual mode');
      return;
    }
    
    if (player.isPlaying) {
      playerEvents.manualPause();
    } else {
      playerEvents.manualPlay();
    }
  };

  // Check if play button should be disabled - Direct state validation
  const isPlayButtonDisabled = () => {
    // Disabled if not in manual mode or manual control not enabled
    if (player.controlMode !== 'manual' || !player.isManualControlEnabled) return true;
    
    // Disabled if no track is selected
    if (!currentTrack) return true;
    
    // Disabled while loading
    if (player.isLoading) return true;
    
    return false;
  };

  // Get play button text with loading state - Direct state access
  const getPlayButtonText = () => {
    if (player.isLoading) return 'Loading...';
    if (player.isPlaying) return 'Pause';
    return 'Play';
  };

  // Handle track selection - Direct state access
  const handleTrackSelect = (trackId: string) => {
    selectTrack(trackId);
  };

  // Handle volume change - Direct state access
  const handleVolumeChange = (newVolume: number) => {
    const volumeLevel = percentageToVolume(newVolume);
    dispatch({
      type: 'UPDATE_VOLUME_STATE',
      payload: { level: volumeLevel }
    });
  };

  // Handle mode switch - Direct state access with validation
  const handleModeSwitch = () => {
    // This function is now used by individual mode buttons
    // The actual mode switching logic is handled by individual button clicks
  };

  // Handle switching to manual mode
  const handleSwitchToManual = () => {
    console.log('PlayerControls: Switching to manual mode');
    onControlModeChange?.('manual');
  };

  // Handle switching to motion mode
  const handleSwitchToMotion = () => {
    const newMode = 'motion';
    
    console.log('PlayerControls: Mode switch requested', {
      currentMode: player.controlMode, 
      newMode,
      motionAvailable: motion.isAvailable,
      motionPermission: motion.hasPermission
    });
    
    // Validate motion mode requirements
    if (!motion.isAvailable) {
      console.warn('PlayerControls: Motion mode not available on this device');
      return;
    }
    
    if (!motion.hasPermission) {
      console.warn('PlayerControls: Motion permission required for motion mode');
      return;
    }
    
    // Delegate to parent component for MotionManager integration
    onControlModeChange?.('motion');
  };

  // Handle seek - Direct state access
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    
    // Use the audio engine's seek method to update actual audio position
    audioEngine.seek(newTime);
    
    // Also update the state for immediate UI feedback
    dispatch({
      type: 'UPDATE_PLAYER_STATE',
      payload: { currentTime: newTime }
    });
  };

  // Get motion button state
  const getMotionButtonState = () => {
    return {
      disabled: !motion.isAvailable || !motion.hasPermission || player.controlMode === 'motion',
      tooltip: !motion.isAvailable 
        ? 'Motion detection not available on this device'
        : !motion.hasPermission 
        ? 'Motion permission required'
        : player.controlMode === 'motion'
        ? 'Motion control is currently active'
        : 'Switch to motion-controlled playback'
    };
  };

  const motionButtonState = getMotionButtonState();
  return (
    <section className="section">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Player Controls
        </h2>

        {/* Track Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Select Track</label>
          <div className="space-y-2">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className={`track-selection-button w-full p-3 text-left rounded border transition-all ${
                  currentTrack?.id === track.id
                    ? 'active'
                    : ''
                } ${player.isLoading && currentTrack?.id === track.id ? 'opacity-75' : ''}`}
                disabled={player.isLoading && currentTrack?.id === track.id}
              >
                <div className="track-title font-medium flex items-center gap-2">
                  {player.isLoading && currentTrack?.id === track.id && (
                    <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  )}
                  {track.title}
                </div>
                <div className="track-subtitle text-sm">{track.artist} • {track.duration}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Control Mode Toggle - Direct state access with validation */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button 
              className={`btn flex-1 ${player.controlMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleSwitchToManual}
              disabled={player.controlMode === 'manual'}
              title="Manual control mode - use buttons to control playback"
            >
              <Hand size={16} />
              Manual Control
            </button>
            <button 
              className={`btn flex-1 ${player.controlMode === 'motion' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleSwitchToMotion}
              disabled={motionButtonState.disabled}
              title={motionButtonState.tooltip}
            >
              <Activity size={16} />
              Motion Control
            </button>
          </div>
          
          {/* Control Mode Status */}
          <div className="mt-2 text-center">
            {player.controlMode === 'manual' ? (
              <p className="text-xs text-secondary">
                Manual mode: Use buttons to control playback
              </p>
            ) : (
              <p className="text-xs text-secondary">
                Motion mode: Move device to play, stay still to pause
              </p>
            )}
            
            {/* Motion availability status */}
            {!motion.isAvailable && (
              <p className="text-xs text-warning mt-1">
                Motion detection not available on this device
              </p>
            )}
            
            {motion.isAvailable && !motion.hasPermission && (
              <p className="text-xs text-warning mt-1">
                Motion permission required for motion mode
              </p>
            )}
          </div>
        </div>

        {/* Playback Controls - Mode-aware validation */}
        <div className="playback-controls-row mb-6">
          <button 
            className="btn btn-secondary"
            onClick={previousTrack}
            disabled={!hasPrevious || player.isLoading}
          >
            <SkipBack size={16} />
            Previous
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handlePlayPause}
            disabled={isPlayButtonDisabled()}
            title={
              player.controlMode !== 'manual' 
                ? 'Only available in manual mode'
                : !currentTrack 
                ? 'Select a track first'
                : player.isLoading 
                ? 'Loading...'
                : 'Play/pause current track'
            }
          >
            {player.isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : player.isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
            {getPlayButtonText()}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={nextTrack}
            disabled={!hasNext || player.isLoading}
          >
            <SkipForward size={16} />
            Next
          </button>
        </div>

        {/* Seek Bar - Direct state access */}
        {currentTrack && (
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Playback Position</label>
            <input
              type="range"
              min="0"
              max={player.trackDuration}
              value={player.currentTime}
              onChange={handleSeek}
              className="slider"
              disabled={!currentTrack || player.isLoading}
            />
            <div className="flex justify-between text-xs text-secondary mt-1">
              <span>{secondsToDuration(player.currentTime)}</span>
              <span>{secondsToDuration(player.trackDuration)}</span>
            </div>
          </div>
        )}

        {/* Volume Control - Direct state access */}
        <div className="volume-control mb-6">
          {volume.level === 0 ? (
            <VolumeX size={16} className="text-secondary" />
          ) : (
            <Volume2 size={16} className="text-secondary" />
          )}
          <div className="slider-container flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={volumeToPercentage(volume.level)}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="slider"
            />
            <div className="flex justify-between text-xs text-secondary">
              <span>0%</span>
              <span className="font-medium">{volumeToPercentage(volume.level)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Auto-Advance Toggle - Direct state access */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <Shuffle size={16} className="text-secondary" />
            <span className="text-sm font-medium">Auto-advance to next track</span>
          </label>
        </div>

        {/* Development Debug Panel - Direct state access */}
        {process.env.NODE_ENV === 'development' && (
          <div>
            <button 
              className="btn btn-secondary text-xs mb-3"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings size={12} />
              {showAdvanced ? 'Hide' : 'Show'} Debug Info
            </button>

            {showAdvanced && (
              <div className="p-3 rounded border text-xs space-y-2" style={{backgroundColor: 'var(--color-debug-background)'}}>
                <p><strong>Current Track:</strong> {currentTrack?.title || 'None'}</p>
                <p><strong>Playback State:</strong> {player.isPlaying ? 'Playing' : 'Paused'}</p>
                <p><strong>Loading State:</strong> {player.isLoading ? 'Loading' : 'Ready'}</p>
                <p><strong>Control Mode:</strong> {player.controlMode}</p>
                <p><strong>Manual Control:</strong> {player.isManualControlEnabled ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Motion Available:</strong> {motion.isAvailable ? 'Yes' : 'No'}</p>
                <p><strong>Motion Permission:</strong> {motion.hasPermission ? 'Granted' : 'Not Granted'}</p>
                <p><strong>Motion State:</strong> {motion.isMoving ? 'Moving' : 'Still'}</p>
                <p><strong>Auto-Advance:</strong> {autoAdvance ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Track Duration:</strong> {secondsToDuration(player.trackDuration)}</p>
                <p><strong>Volume Level:</strong> {volume.level.toFixed(2)} ({volumeToPercentage(volume.level)}%)</p>
                <p><strong>Playlist Tracks:</strong> {tracks.length}</p>
                <p><strong>AudioEngine:</strong> {audioEngine.isInitialized ? 'Ready' : 'Initializing'}</p>
                <p className="text-blue-600"><strong>Step 2.2 Status:</strong> Direct state access implemented</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerControls;