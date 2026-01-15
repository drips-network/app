import { redeemGitHubOAuthCode } from '$lib/utils/wave/auth';
import { error } from '@sveltejs/kit';

export default async function performLogin(url: URL) {
  // extract gh oauth code and state from url
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    throw error(400, 'Missing code or state in callback URL');
  }

  try {
    // exchange for wave login
    // this sets wave_refresh_token and wave_access_token cookies via the API response
    const { accessToken, newUser } = await redeemGitHubOAuthCode(code, state);

    if (!accessToken) {
      throw error(401, 'Failed to exchange GitHub OAuth code for access token');
    }

    return { accessToken, newUser };
  } catch {
    throw error(500, 'GitHub OAuth exchange failed. GitHub may be experiencing issues.');
  }
}
