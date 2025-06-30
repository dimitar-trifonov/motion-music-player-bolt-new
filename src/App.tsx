// Updated App Component
// Now includes PlaylistProvider in the component tree

import React from 'react';
import { AppStateProvider } from './state/AppStateContext';
import { PlaylistProvider } from './providers/PlaylistProvider';
import MotionMusicPlayer from './components/MotionMusicPlayer';
import DesignShowcase from './components/DesignShowcase';
import ThemeToggle from './components/ThemeToggle';
import './styles/design-system.css';

function App() {
  return (
    <AppStateProvider>
      <PlaylistProvider>
        <div className="app-container">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Bolt.new Badge */}
          <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bolt-badge"
            title="Powered by Bolt.new"
          >
            <img 
              src="/logotext_poweredby_360w.png" 
              alt="Powered by Bolt.new" 
            />
          </a>
          
          {/* Header */}
          <DesignShowcase />
          
          {/* Main Player */}
          <MotionMusicPlayer />
        </div>
      </PlaylistProvider>
    </AppStateProvider>
  );
}

export default App;