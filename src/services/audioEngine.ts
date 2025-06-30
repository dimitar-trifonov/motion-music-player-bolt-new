// Simplified Audio Engine Service
// Only handles audio playback mechanics - no playlist knowledge

import { getAudioConfig } from '../config/appConfig';

export interface AudioEngineConfig {
  volume?: number;
  preload?: 'none' | 'metadata' | 'auto';
}

export interface AudioEngineCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

export class AudioEngine {
  private audio: HTMLAudioElement;
  private callbacks: AudioEngineCallbacks = {};

  constructor(config: AudioEngineConfig = {}) {
    const audioConfig = getAudioConfig();
    this.audio = new Audio();
    this.audio.volume = config.volume ?? audioConfig.defaultVolume;
    this.audio.preload = config.preload ?? audioConfig.preloadStrategy;
    
    this.setupEventListeners();
    console.log('AudioEngine: Initialized');
  }

  private setupEventListeners() {
    this.audio.addEventListener('loadstart', () => {
      console.log('AudioEngine: Load started');
      this.callbacks.onLoadStart?.();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      console.log('AudioEngine: Metadata loaded, duration:', this.audio.duration);
      this.callbacks.onDurationChange?.(this.audio.duration);
    });

    this.audio.addEventListener('canplay', () => {
      console.log('AudioEngine: Can play');
      this.callbacks.onLoadEnd?.();
    });

    this.audio.addEventListener('play', () => {
      console.log('AudioEngine: Playing');
      this.callbacks.onPlay?.();
    });

    this.audio.addEventListener('pause', () => {
      console.log('AudioEngine: Paused');
      this.callbacks.onPause?.();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.callbacks.onTimeUpdate?.(this.audio.currentTime);
    });

    this.audio.addEventListener('ended', () => {
      console.log('AudioEngine: Track ended');
      this.callbacks.onEnded?.();
    });

    this.audio.addEventListener('error', (e) => {
      const errorMsg = `Audio error: ${this.audio.error?.message || 'Unknown error'}`;
      console.error('AudioEngine:', errorMsg);
      this.callbacks.onError?.(errorMsg);
    });
  }

  // Load audio file
  async loadTrack(filePath: string): Promise<boolean> {
    try {
      console.log('AudioEngine: Loading track from:', filePath);
      
      // Stop current playback
      this.audio.pause();
      this.audio.currentTime = 0;

      // Set new source
      this.audio.src = `${window.location.origin}${filePath}`;

      // Wait for metadata to load
      return new Promise((resolve) => {
        const onLoadedMetadata = () => {
          console.log('AudioEngine: Track loaded successfully');
          this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          this.audio.removeEventListener('error', onError);
          resolve(true);
        };

        const onError = () => {
          console.error('AudioEngine: Failed to load track');
          this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          this.audio.removeEventListener('error', onError);
          resolve(false);
        };

        this.audio.addEventListener('loadedmetadata', onLoadedMetadata);
        this.audio.addEventListener('error', onError);
        
        // Start loading
        this.audio.load();
      });
    } catch (error) {
      console.error('AudioEngine: Error loading track:', error);
      return false;
    }
  }

  // Play audio
  async play(): Promise<boolean> {
    try {
      if (this.audio.readyState < 2) {
        console.warn('AudioEngine: Audio not ready to play');
        return false;
      }

      await this.audio.play();
      return true;
    } catch (error) {
      console.error('AudioEngine: Failed to play:', error);
      return false;
    }
  }

  // Pause audio
  pause(): void {
    this.audio.pause();
  }

  // Seek to position
  seek(position: number): void {
    if (this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, position));
    }
  }

  // Set volume (0-1)
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  // Get current state
  getState() {
    return {
      isPlaying: !this.audio.paused,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      volume: this.audio.volume,
      readyState: this.audio.readyState,
      src: this.audio.src
    };
  }

  // Set callbacks
  setCallbacks(callbacks: AudioEngineCallbacks): void {
    // Merge new callbacks with existing ones, preserving existing callbacks
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('AudioEngine: Callbacks updated');
  }

  // Cleanup
  destroy(): void {
    this.audio.pause();
    this.audio.src = '';
    this.callbacks = {};
    console.log('AudioEngine: Destroyed');
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();