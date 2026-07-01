// ============================================================================
// BLOCKS - Online Status Hook
// Detects network connectivity for offline-aware features
// ============================================================================

import { useState, useEffect } from "react";

/**
 * Hook to track online/offline status
 * 
 * @returns boolean indicating if the app is online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;

