import { redeemGitHubOAuthCode } from '$lib/utils/wave/auth';
import { AccountSuspendedError } from '$lib/utils/wave/call';
import { error, isHttpError } from '@sveltejs/kit';
import { browser } from '$app/environment';

/**
 * Thrown when this callback's code was already submitted by an earlier load of
 * the page, so redeeming it again is pointless — the login flow needs to be
 * restarted from the login page instead.
 */
export class LoginRestartRequiredError extends Error {
  constructor() {
    super('OAuth code was already redeemed by a previous attempt');
    this.name = 'LoginRestartRequiredError';
  }
}

const ATTEMPTED_CODE_KEY = 'wave-oauth-attempted-code';

/**
 * The backend responds with `{"error": "..."}` bodies that `call()` embeds in
 * its thrown Error message. Surface that message instead of a generic one —
 * "OAuth session expired. Please try again." is a lot more actionable than
 * blaming GitHub.
 */
function extractApiErrorMessage(err: unknown): string | null {
  if (!(err instanceof Error)) return null;

  const jsonPart = err.message.match(/\{.*\}$/s)?.[0];
  if (!jsonPart) return null;

  try {
    const body: unknown = JSON.parse(jsonPart);
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Not a JSON body — fall through to the generic message.
  }

  return null;
}

export default async function performLogin(url: URL) {
  // extract gh oauth code and state from url
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    throw error(400, 'Missing code or state in callback URL');
  }

  // The code (and the nonce behind it) is single-use, but a reload of the
  // callback page re-runs this with the same code — guaranteed to fail with
  // "already used", even though the first attempt may have succeeded
  // server-side with its response lost (e.g. reload while the ~1.5s exchange
  // was in flight). Mark the code as attempted *before* redeeming so any
  // later load can tell, and restart the login instead of burning a request.
  if (browser && sessionStorage.getItem(ATTEMPTED_CODE_KEY) === code) {
    throw new LoginRestartRequiredError();
  }
  if (browser) sessionStorage.setItem(ATTEMPTED_CODE_KEY, code);

  try {
    // exchange for wave login
    // this sets wave_refresh_token and wave_access_token cookies via the API response
    const { accessToken, newUser } = await redeemGitHubOAuthCode(code, state);

    if (!accessToken) {
      throw error(401, 'Failed to exchange GitHub OAuth code for access token');
    }

    return { accessToken, newUser };
  } catch (e) {
    if (e instanceof AccountSuspendedError) throw e;
    if (isHttpError(e)) throw e;

    throw error(
      500,
      extractApiErrorMessage(e) ??
        'GitHub OAuth exchange failed. GitHub may be experiencing issues.',
    );
  }
}
