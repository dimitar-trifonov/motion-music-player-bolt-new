// Motion Status Component - Pure UI Component (Step 0.5)
// All motion detection logic removed, keeping only UI structure and state display (Step 0.4)

import React, { useState } from 'react';
import { Smartphone, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react';
import { useAppState } from '../state/AppStateContext';

interface MotionStatusProps {
  onControlModeChange?: (mode: 'manual' | 'motion') => void;
}

const MotionStatus: React.FC<MotionStatusProps> = ({ onControlModeChange }) => {
  const { state } = useAppState();
  const [sensitivity, setSensitivity] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const motionState = state.motion;

  // Pure UI handlers - no business logic, only UI state updates
  const handlePermissionRequest = () => {
    console.log('MotionStatus: Permission request triggered');
    // Dynamic import to avoid circular dependencies
    import('../services/globalMotionManager').then(({ globalMotionManager }) => {
      globalMotionManager.requestPermission().then((granted) => {
        if (granted) {
          console.log('MotionStatus: Permission granted, switching to motion mode');
          // Auto-switch to motion mode when permission is granted
          onControlModeChange?.('motion');
        } else {
          console.log('MotionStatus: Permission denied, staying in manual mode');
        }
      });
    });
  };

  const handleSensitivityChange = (newSensitivity: number) => {
    setSensitivity(newSensitivity);
    console.log('MotionStatus: Sensitivity change:', newSensitivity);
    // Dynamic import to avoid circular dependencies
    import('../services/globalMotionManager').then(({ globalMotionManager }) => {
      globalMotionManager.setSensitivity(newSensitivity);
    });
  };

  const handleModeToggle = () => {
    const newMode = motionState.controlMode === 'manual' ? 'motion' : 'manual';
    console.log('MotionStatus: Mode toggle to:', newMode);
    onControlModeChange?.(newMode);
  };

  // Pure UI state getters - no business logic
  const getStatusIcon = () => {
    if (!motionState.isAvailable) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (!motionState.hasPermission) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (!motionState.isAvailable) {
      return 'Motion detection: Not available';
    }
    if (!motionState.hasPermission) {
      return 'Motion detection: Permission required';
    }
    return 'Motion detection: Ready';
  };

  const getMotionIndicator = () => {
    if (!motionState.hasPermission) {
      return <div className="status-dot inactive"></div>;
    }
    if (motionState.isMoving) {
      return <div className="status-dot active motion-pulse"></div>;
    }
    return <div className="status-dot inactive"></div>;
  };

  return (
    <section className="section">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
          <Smartphone className="w-5 h-5" />
          Motion Detection Status
        </h2>

        {/* Availability Status */}
        <div className="space-y-md text-center">
          <div className="status-indicator justify-center">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>

          {/* Permission Button */}
          {motionState.isAvailable && !motionState.hasPermission && (
            <div className="flex justify-center">
              <button 
                className="btn btn-primary"
                onClick={handlePermissionRequest}
              >
                <Smartphone size={16} />
                Enable Motion Detection
              </button>
            </div>
          )}

          {/* Motion State Indicator */}
          {motionState.hasPermission && (
            <div className="status-indicator justify-center">
              {getMotionIndicator()}
              <span className="font-medium">
                {motionState.controlMode === 'motion' 
                  ? `Motion Active: ${motionState.isMoving ? 'Moving' : 'Still'}`
                  : `Motion Ready: ${motionState.isMoving ? 'Moving' : 'Still'}`
                }
              </span>
            </div>
          )}

          {/* Control Mode Toggle */}
          {motionState.hasPermission && (
            <div className="flex gap-2 justify-center">
              <button 
                className={`btn ${motionState.controlMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleModeToggle}
                disabled={motionState.controlMode === 'manual'}
              >
                Manual Control
              </button>
              <button 
                className={`btn ${motionState.controlMode === 'motion' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleModeToggle}
                disabled={motionState.controlMode === 'motion'}
              >
                Motion Control
              </button>
            </div>
          )}

          {/* Motion Sensitivity Slider */}
          {motionState.hasPermission && (
            <div className="slider-container">
              <div className="flex items-center justify-center mb-2">
                <label className="text-sm font-medium">Motion Sensitivity</label>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={sensitivity}
                onChange={(e) => handleSensitivityChange(Number(e.target.value))}
                className="slider"
                disabled={!motionState.hasPermission}
              />
              
              <div className="flex justify-center gap-8 text-xs text-secondary">
                <span>Low (0)</span>
                <span className="font-medium">{sensitivity}%</span>
                <span>High (100)</span>
              </div>
              
              {/* Advanced Status Section */}
              <div className="mt-4">
                <div className="flex items-center justify-center gap-4">
                  <label className="text-sm font-medium">Advanced Status</label>
                  <button 
                    className="btn btn-secondary text-xs"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <Settings size={12} />
                    {showAdvanced ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Debug Info */}
          {showAdvanced && motionState.hasPermission && (
            <div className="p-3 rounded border text-xs space-y-1 text-left max-w-md mx-auto mt-2" style={{backgroundColor: 'var(--color-debug-background)'}}>
              <p><strong>Control Mode:</strong> {motionState.controlMode}</p>
              <p><strong>Device Motion API:</strong> {'DeviceMotionEvent' in window ? 'Available' : 'Not Available'}</p>
              <p><strong>Secure Context:</strong> {window.isSecureContext ? 'Yes' : 'No'}</p>
            </div>
          )}

          {/* Security Notice */}
          {!motionState.isAvailable && (
            <div className="security-warning text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle size={16} />
                <span className="font-medium">Motion Detection Unavailable</span>
              </div>
              <p className="text-sm">
                Motion detection services have been removed (Step 0.4). 
                Only manual control is available.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MotionStatus;