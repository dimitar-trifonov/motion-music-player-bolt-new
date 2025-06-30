// Player Status Component - Manual Mode Only (Step 0.6)
// Removed all motion state dependencies from player status display

import React from 'react';
import { Music, Play, Pause, Loader2, AlertCircle } from 'lucide-react';
import { useAppState } from '../state/AppStateContext';
import { usePlaylist } from '../providers/PlaylistProvider';
import { secondsToDuration } from '../state/playlistState';

const PlayerStatus: React.FC = () => {
  const { state } = useAppState();
  const { currentTrack, tracks } = usePlaylist();
  const { player } = state;

  const getPlaybackIcon = () => {
    if (player.isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (player.isPlaying) {
      return <Play className="w-5 h-5 text-green-500" />;
    }
    return <Pause className="w-5 h-5 text-gray-500" />;
  };

  const getPlaybackText = () => {
    if (player.isLoading) return 'Loading...';
    if (player.isPlaying) return 'Playing';
    return 'Paused';
  };

  const formatTime = (seconds: number): string => {
    return secondsToDuration(seconds);
  };

  const getProgressPercentage = (): number => {
    if (!player.trackDuration || player.trackDuration === 0) return 0;
    return (player.currentTime / player.trackDuration) * 100;
  };

  return (
    <section className="section">
      <div className="card">
        <div className="track-info">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-primary" />
          </div>

          {/* Track Information */}
          {currentTrack ? (
            <>
              <h3 className="text-lg font-semibold mb-2 text-center">
                {currentTrack.title}
              </h3>
              <p className="text-sm text-secondary text-center mb-4">
                {currentTrack.artist}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2 text-center text-gray-400">
                No Track Selected
              </h3>
              <p className="text-sm text-secondary text-center mb-4">
                Select a track to begin
              </p>
            </>
          )}

          {/* Playback Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {getPlaybackIcon()}
            <span className="font-medium text-sm">
              {getPlaybackText()}
            </span>
          </div>

          {/* Progress Bar */}
          {currentTrack && (
            <div className="mt-4">
              <div className="progress-bar mb-2">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-secondary">
                <span>{formatTime(player.currentTime)}</span>
                <span>{formatTime(player.trackDuration)}</span>
              </div>
            </div>
          )}

          {/* Control Mode Indicator - SIMPLIFIED (no motion state dependencies) */}
          <div className="control-mode-indicator mt-4 p-3 rounded border text-center" style={{backgroundColor: 'var(--color-track-info-background)', borderColor: 'var(--color-track-info-border)'}}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className={`status-dot ${
                player.controlMode === 'motion' 
                  ? (player.isPlaying ? 'active' : 'inactive')
                  : 'inactive'
              }`}></div>
              <span className="text-sm font-medium">
                {player.controlMode === 'motion' ? 'Motion Control' : 'Manual Control'}
                {player.isPlaying && (
                  <span className="ml-2 text-xs text-success">
                    • Playing
                  </span>
                )}
                {!player.isPlaying && currentTrack && (
                  <span className="ml-2 text-xs text-secondary">
                    • Paused
                  </span>
                )}
              </span>
            </div>
            <p className="text-xs text-secondary">
              {player.controlMode === 'motion' 
                ? 'Move your device to play music, stay still to pause'
                : 'Use the player controls to manage playback'
              }
            </p>
          </div>

          {/* Error State */}
          {!currentTrack && tracks.length === 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-center">
              <AlertCircle className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <p className="text-sm text-red-700">No tracks available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PlayerStatus;