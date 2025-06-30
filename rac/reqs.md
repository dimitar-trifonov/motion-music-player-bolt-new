# Motion-Controlled Music Player Requirements

## Core Concept
A music player controlled by device motion, using two simple states:
- Moving: Device is in motion → Play music
- Still: Device is stationary → Pause music

## Technical Approach
- Using Device Motion API for motion detection
- Simple binary state detection (moving/still)
- No complex gesture recognition needed
- Implement 500ms delay for state changes to prevent rapid toggling
- Initial state: Paused, waiting for motion

## Key Features
1. Motion Detection
   - Detect when device is moving vs still
   - Use Device Motion API for reliable motion sensing
   - Implement appropriate thresholds for state changes
   - Moving state triggers play
   - Still state triggers pause
   - 500ms delay before state changes
   - Visual motion indicator showing current state (Moving/Still)

2. Player Controls
   - Play when device is moving
   - Pause when device is still
   - Volume control slider (default: 70%)
   - Song seek bar
   - Next/Previous track buttons
   - Playlist selection interface
   - Auto-advance mode for all track changes

3. Auto-Advance Mode
   - Automatically play next track when current track ends
   - Auto-advance on manual track changes (next/previous)
   - Auto-advance on playlist selection
   - Maintains play/pause state based on motion

4. Volume Management
   - Default volume: 70%
   - Volume safety limits:
     * Maximum volume cap at -3 dB to prevent distortion
     * Minimum volume at -60 dB (effectively silent)
     * Smooth volume transitions (ramping) to prevent audio artifacts
     * Volume changes limited to 0.1 dB steps for smooth control
   - Volume persistence between sessions

5. Playlist Structure
   - Static JSON configuration
   - Music files stored in project's `music/` directory
   - JSON format:
     ```json
     [
       {
         "name": "Track1",
         "artist": "Artist1",
         "duration": "180",
         "file": "track1.mp3"
       },
       {
         "name": "Track2",
         "artist": "Artist2",
         "duration": "240",
         "file": "track2.mp3"
       }
     ]
     ```
   - All audio files should be in MP3 format
   - Duration is specified in seconds as a string
   - File paths are relative to the music directory


## Next Steps
1. Define the basic state structure
2. Implement motion detection logic with delay
3. Create player control events
4. Design the user interface
5. Implement auto-advance functionality
6. Set up playlist JSON structure
7. Create music directory structure
