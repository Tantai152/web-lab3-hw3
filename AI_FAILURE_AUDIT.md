# AI FAILURE MODE AUDIT — KRAFTON PUBG VN Arena

## Overview

Audit of common errors when using AI to generate React 19 code related to Timers, Optimistic UI, and Race Conditions.

## Vulnerability 01: Naive `setInterval` Countdown Drift

**AI Prompt used:**

"Add a 1-hour countdown timer for the airdrop"

**AI Generated Code (Error):**

```javascript
const [seconds, setSeconds] = useState(3600);
useEffect(() => {
  const id = setInterval(() => setSeconds(s => s - 1), 1000);
  return () => clearInterval(id);
}, []);
```

**Risk:** CWE-400 (Uncontrolled Resource Consumption) + Clock Drift. Chrome throttles background tabs to 1 tick/minute. If the user switches tabs for 10 minutes, the clock only decreases by 10 seconds (instead of 10 minutes). Additionally, decrementing state based on tick count (rather than real time) causes the clock to drift if the main thread is busy (lag/jank).

**Detection Method:** Switch to another tab for 30s, come back and see the clock only decreased by 1-2s instead of 30s.

**Engineering Refactor:**

```javascript
const calcRemaining = () => Math.max(0, targetEpochMs - Date.now());
useEffect(() => {
  const syncClock = () => setRemainingMs(calcRemaining());
  syncClock(); // Sync immediately
  const id = setInterval(syncClock, 200);
  const onWake = () => {
    if (document.visibilityState === 'visible') syncClock();
  };
  document.addEventListener('visibilitychange', onWake);
  return () => {
    clearInterval(id);
    document.removeEventListener('visibilitychange', onWake);
  };
}, [targetEpochMs]);
```

**Verification:** Switch tab for 30s, come back and see the clock jumped exactly 30s. No drift.

## Vulnerability 02: Optimistic UI Missing Rollback

**AI Prompt used:**

"Implement a claim button that decreases stock instantly"

**AI Generated Code (Error):**

```javascript
const handleClaim = async (id) => {
  setCrates(prev => prev.map(c => c.id === id ? { ...c, stock: c.stock - 1 } : c));
  await mockClaimCrate(id); // Error: No catch, no rollback
};
```

**Risk:** CWE-362 (Race Condition / State Inconsistency). When the server returns a 409 error (Out of stock), stock on the UI has been deducted but actually there is no stock. If the user F5 (refreshes), stock returns to its original state, causing serious data inconsistency.

**Detection Method:** Click Claim until hitting ~30% error rate (409). See stock deducted but no error message, UI shows phantom data.

**Engineering Refactor:**

```javascript
const handleClaim = async (id) => {
  setClaimingId(id);
  setCrates(prev => prev.map(c => c.id === id ? { ...c, stock: c.stock - 1 } : c));
  try {
    await mockClaimCrate(id);
  } catch (err) {
    if (err.name === 'AbortError') return;
    // Rollback
    setCrates(prev => prev.map(c => c.id === id ? { ...c, stock: c.stock + 1 } : c));
    setError(err.message);
  } finally {
    setClaimingId(null);
  }
};
```

**Verification:** On 409 error, stock automatically adds back 1, red banner displays "409 Conflict". Data is synchronized.

## Vulnerability 03: Memory Leak from visibilitychange Listener

**AI Prompt used:**

"Sync the timer when tab becomes visible again"

**AI Generated Code (Error):**

```javascript
useEffect(() => {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncClock();
  });
  // Error: No return cleanup
}, []);
```

**Risk:** CWE-401 (Memory Leak). Each time the component mounts/unmounts (or React StrictMode runs twice), a new listener is attached to the document. On unmount, the old listener still exists and holds a reference to the dead component, causing memory leaks and calling useless callbacks.

**Detection Method:** Open Chrome Performance Monitor, mount/unmount component several times, see the number of Event Listeners increasing without decreasing.

**Engineering Refactor:**

```javascript
useEffect(() => {
  const onWake = () => {
    if (document.visibilityState === 'visible') syncClock();
  };
  document.addEventListener('visibilitychange', onWake);
  return () => {
    document.removeEventListener('visibilitychange', onWake); // Cleanup
  };
}, []);
```

**Verification:** Console log in cleanup runs correctly on unmount. Number of listeners does not increase after multiple mount/unmounts.

## Summary Table

| # | Vulnerability | CWE | Severity | Fixed |
|---|---|---|---|---|
| 01 | Naive Timer Drift | CWE-400 | High | Yes |
| 02 | Missing Optimistic Rollback | CWE-362 | Critical | Yes |
| 03 | Listener Memory Leak | CWE-401 | Medium | Yes |
