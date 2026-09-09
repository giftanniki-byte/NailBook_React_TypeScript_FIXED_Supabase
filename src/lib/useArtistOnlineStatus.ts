import { useEffect, useState } from "react";
import { getTodayMetrics, setOnlineStatus } from "./artistDashboard";

/**
 * Artist online/offline status, shared by anywhere it needs to appear
 * (the main nav bar, previously also duplicated inside the dashboard's
 * own tab bar — now there's a single source of truth here instead).
 */
export function useArtistOnlineStatus(enabled: boolean) {
  const [online, setOnline] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getTodayMetrics()
      .then((metrics) => {
        if (!active) return;
        if (metrics) {
          setOnline(metrics.is_available);
          setError(null);
        } else {
          setError("No artist profile found for this account yet.");
        }
      })
      .catch((err) => {
        if (!active) return;
        // Surfaced via `error` below and logged so the real cause (an RLS
        // policy, a missing migration, a network issue) is visible instead
        // of the toggle just silently refusing to ever enable.
        console.error("useArtistOnlineStatus: failed to load status", err);
        setError(err instanceof Error ? err.message : "Couldn't load online status.");
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  async function toggle() {
    if (online === null || busy) return;
    const next = !online;
    setBusy(true);
    setOnline(next); // optimistic
    setError(null);
    try {
      await setOnlineStatus(next);
    } catch (err) {
      console.error("useArtistOnlineStatus: failed to save status", err);
      setOnline(!next); // revert on failure
      setError(err instanceof Error ? err.message : "Couldn't update your status.");
    } finally {
      setBusy(false);
    }
  }

  return { online, busy, error, toggle };
}
