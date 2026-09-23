import { browser } from '$app/environment';
import { getAccessTokenCookieClientSide, getUserData } from '$lib/utils/wave/auth.js';

// Offset between the server clock and this device's clock, so token expiry is
// judged against server time rather than a possibly skewed `Date.now()`. The
// universal load re-runs on client navigations while `data.serverTime` may
// not, so only recompute the offset when a new server time arrives.
let lastServerTime: number | undefined;
let clockOffsetMs = 0;

function correctedNow(serverTime: number | undefined): number {
  if (serverTime === undefined) return Date.now();

  if (serverTime !== lastServerTime) {
    lastServerTime = serverTime;
    clockOffsetMs = serverTime - Date.now();
  }

  return Date.now() + clockOffsetMs;
}

export const load = async ({ depends, data }) => {
  depends('wave:user');
  depends('wave:phone-verification-required');

  let accessTokenCookieValue: string | null = null;

  if (browser) {
    // access token is in cookies on client
    accessTokenCookieValue = getAccessTokenCookieClientSide();
  } else {
    // on server, just read from locals
    accessTokenCookieValue = data.waveAccessToken ?? null;
  }

  // parse out the token
  const accessToken = accessTokenCookieValue ? decodeURIComponent(accessTokenCookieValue) : null;

  const userData = browser
    ? getUserData(accessToken, correctedNow(data.serverTime))
    : getUserData(accessToken);

  return {
    user: userData,
  };
};
