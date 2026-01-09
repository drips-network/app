import { browser } from '$app/environment';
import { getUserData, setAccessJwt } from '$lib/utils/wave/auth.js';

export const load = async ({ depends, data }) => {
  depends('wave:user');

  let accessToken: string | null;

  if (browser) {
    // set the new login. if there is none, it means the user is logged out (e.g. expired refresh token)

    setAccessJwt(data.newWaveAccessToken);
    accessToken = data.newWaveAccessToken;
  } else {
    // on server, just read from locals
    accessToken = data.newWaveAccessToken ?? null;
  }

  const userData = getUserData(accessToken);

  return {
    user: userData,
  };
};
