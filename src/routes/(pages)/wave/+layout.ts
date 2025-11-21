import { browser } from '$app/environment';
import { getAccessJwt, getUserData, setAccessJwt } from '$lib/utils/wave/auth.js';

export const load = async ({ depends, data }) => {
  depends('wave:user');

  let accessToken: string | null;

  if (browser) {
    if (data.newWaveAccessToken) setAccessJwt(data.newWaveAccessToken);

    accessToken = getAccessJwt();
  } else {
    accessToken = data.newWaveAccessToken ?? null;
  }

  const userData = getUserData(accessToken);

  return {
    user: userData,
  };
};

export const ssr = true;
