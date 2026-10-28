// src/hooks/usePubgAirdropTimer.js

import { useEffect, useState } from 'react';

export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  // Calculate remaining time from the absolute target timestamp.
  // Using Date.now() instead of decrementing state prevents drift
  // caused by delayed interval callbacks, background tabs, or lag.
  const calcRemaining = () =>
    Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs));

  const [remainingMs, setRemainingMs] = useState(calcRemaining);

  useEffect(() => {
    // Recalculate from the clock immediately and on every tick.
    const syncClock = () => {
      setRemainingMs(calcRemaining());
    };

    syncClock();

    // Use a 200ms interval for smooth timer updates.
    const id = setInterval(syncClock, 200);

    // Resynchronize when the tab becomes visible again.
    const onWake = () => {
      if (document.visibilityState === 'visible') {
        syncClock();
      }
    };

    document.addEventListener('visibilitychange', onWake);

    // Clean up the interval and event listener on unmount or changes.
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onWake);
    };
  }, [targetEpochMs, serverOffsetMs]);

  return {
    remainingMs,
    isLive: remainingMs === 0,
  };
}
