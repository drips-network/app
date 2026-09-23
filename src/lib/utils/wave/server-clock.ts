import { browser } from '$app/environment';

// Offset between the server clock and this device's clock, so token expiry can
// be judged against server time rather than a possibly skewed `Date.now()`.
//
// This state is browser-only by construction: `correctedNow` returns the plain
// wall clock on the server before touching it, so nothing here is ever shared
// between requests in the Node process. In the browser the module is per tab.
let lastServerTime: number | undefined;
let clockOffsetMs = 0;

/**
 * Returns "now" in milliseconds, corrected for the skew between this device and
 * the server. `serverTime` is `Date.now()` as stamped by the server load that
 * produced the current page data. A universal load re-runs on client-side
 * navigations while that server data may not, so the offset is only recomputed
 * when a new server time arrives; between arrivals the local clock advances it.
 */
export function correctedNow(serverTime: number | undefined): number {
  if (!browser || serverTime === undefined) return Date.now();

  if (serverTime !== lastServerTime) {
    lastServerTime = serverTime;
    clockOffsetMs = serverTime - Date.now();
  }

  return Date.now() + clockOffsetMs;
}
