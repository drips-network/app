import { redeemGitHubOAuthCode, setAccessJwt } from '$lib/utils/wave/auth.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
  // extract gh oauth code and state from url
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    throw error(400, 'Missing code or state in callback URL');
  }

  // exchange for wave login
  const accessToken = await redeemGitHubOAuthCode(code, state);

  if (!accessToken) {
    throw error(401, 'Failed to exchange GitHub OAuth code for access token');
  }

  setAccessJwt(accessToken);

  return redirect(302, '/wave');
};

export const ssr = false;
