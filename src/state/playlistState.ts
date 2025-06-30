// Playlist State Implementation
// Based on rac/state/playlist.rac.yaml specification

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string; // Duration in "MM:SS" format
  file: string; // Path to music file
}

export interface PlaylistState {
  tracks: Track[];
}

// Load playlist from the JSON file in public/music/
export const initialPlaylistState: PlaylistState = {
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

// Playlist utility functions
export const getTrackById = (playlist: PlaylistState, trackId: string): Track | null => {
  return playlist.tracks.find(track => track.id === trackId) || null;
};

export const getNextTrackId = (playlist: PlaylistState, currentTrackId: string): string | null => {
  const currentIndex = playlist.tracks.findIndex(track => track.id === currentTrackId);
  
  if (currentIndex === -1) {
    return null; // Current track not found
  }
  
  // If it's the last track, return the first track (loop)
  if (currentIndex === playlist.tracks.length - 1) {
    return playlist.tracks[0]?.id || null;
  }
  
  // Return next track
  return playlist.tracks[currentIndex + 1]?.id || null;
};

export const getPreviousTrackId = (playlist: PlaylistState, currentTrackId: string): string | null => {
  const currentIndex = playlist.tracks.findIndex(track => track.id === currentTrackId);
  
  if (currentIndex === -1) {
    return null; // Current track not found
  }
  
  // If it's the first track, return the last track (loop)
  if (currentIndex === 0) {
    return playlist.tracks[playlist.tracks.length - 1]?.id || null;
  }
  
  // Return previous track
  return playlist.tracks[currentIndex - 1]?.id || null;
};

export const getFirstTrackId = (playlist: PlaylistState): string | null => {
  return playlist.tracks[0]?.id || null;
};

export const validatePlaylist = (playlist: PlaylistState): boolean => {
  // Validate playlist has tracks
  if (!playlist.tracks || playlist.tracks.length === 0) {
    return false;
  }
  
  // Validate each track has required fields
  return playlist.tracks.every(track => 
    track.id && 
    track.title && 
    track.artist && 
    track.duration && 
    track.file
  );
};

// Convert duration string to seconds
export const durationToSeconds = (duration: string): number => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return (minutes * 60) + seconds;
};

// Convert seconds to duration string
export const secondsToDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};