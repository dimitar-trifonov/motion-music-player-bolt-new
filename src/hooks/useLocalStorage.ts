// Local Storage Hook for State Persistence (Step 0.3)
// Motion sensitivity persistence removed

import { getStorageConfig } from '../config/appConfig';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Specific hooks for persisting player settings (motion sensitivity removed)
const storageConfig = getStorageConfig();

export const usePersistedVolume = () => {
  return useLocalStorage(storageConfig.keys.volume, storageConfig.defaults.volume);
};

export const usePersistedAutoAdvance = () => {
  return useLocalStorage(storageConfig.keys.autoAdvance, storageConfig.defaults.autoAdvance);
};

export const usePersistedControlMode = () => {
  return useLocalStorage<'manual' | 'motion'>(storageConfig.keys.controlMode, storageConfig.defaults.controlMode);
};