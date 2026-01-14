import { browser } from '$app/environment';
import { getAccessTokenCookieClientSide, getUserData } from '$lib/utils/wave/auth.js';

export const load = async ({ depends, data }) => {
  depends('wave:user');

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

  const userData = getUserData(accessToken);

  return {
    user: userData,
  };
};
