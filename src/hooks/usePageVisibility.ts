import { useEffect, useCallback } from 'react';

export interface PageVisibilityOptions {
  onVisibilityChange: (isVisible: boolean) => void;
}

/**
 * Custom hook for handling page visibility changes
 * Uses the Page Visibility API to detect when the tab loses/gains focus
 */
export const usePageVisibility = (onVisibilityChange: (isVisible: boolean) => void) => {
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    onVisibilityChange(isVisible);
  }, [onVisibilityChange]);

  useEffect(() => {
    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Return current visibility state
  return !document.hidden;
};

export default usePageVisibility;