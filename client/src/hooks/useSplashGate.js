import { useEffect, useState } from "react";

const APP_START = Date.now();

/** Keep splash visible until auth is ready AND at least `minMs` since app start. */
export function useSplashGate(initializing, minMs = 2500) {
  const [minElapsed, setMinElapsed] = useState(
    () => Date.now() - APP_START >= minMs
  );

  useEffect(() => {
    if (minElapsed) return undefined;
    const remaining = Math.max(0, minMs - (Date.now() - APP_START));
    const timer = window.setTimeout(() => setMinElapsed(true), remaining);
    return () => window.clearTimeout(timer);
  }, [minMs, minElapsed]);

  return initializing || !minElapsed;
}

export default useSplashGate;
