import z from 'zod';
import setCookieParser from 'set-cookie-parser';
import { isRedirect, redirect, type RequestEvent } from '@sveltejs/kit';

const WAVE_TOKEN_COOKIES = ['wave_refresh_token', 'wave_access_token'];

function clearWaveSession(event: RequestEvent) {
  event.cookies.delete('wave_refresh_token', { path: '/' });
  event.cookies.delete('wave_access_token', { path: '/' });
  delete event.locals.waveRefreshToken;
  delete event.locals.waveAccessToken;
}

async function doRefresh(
  event: RequestEvent,
  apiUrl: string,
  refreshToken: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/api/auth/token/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Cookie: `wave_refresh_token=${refreshToken}` },
    });

    if (!res.ok) {
      if (res.status === 403) {
        const body = await res.text();
        // The machine-readable `code` match runs before the bare-word
        // 'suspended' one so prose can't shadow it.
        if (body.includes('unverified_email')) {
          clearWaveSession(event);
          throw redirect(302, '/wave/unverified-email');
        }
        if (body.includes('suspended')) {
          clearWaveSession(event);
          throw redirect(302, '/wave/suspended');
        }
      }
      throw new Error('Failed to refresh token');
    }

    const data = z
      .object({
        accessToken: z.string(),
      })
      .parse(await res.json());

    event.locals.waveRefreshToken = refreshToken;
    event.locals.waveAccessToken = data.accessToken;

    // Forward new cookies to browser
    for (const str of setCookieParser.splitCookiesString(res.headers.get('set-cookie') ?? '')) {
      const parsed = setCookieParser.parseString(str);
      if (!parsed) continue;
      const { name, value, ...options } = parsed;

      if (WAVE_TOKEN_COOKIES.includes(name)) {
        event.cookies.set(name, value, {
          ...options,
          sameSite: options.sameSite as 'lax' | 'strict' | 'none',
          path: options.path || '/',
          httpOnly: name === 'wave_refresh_token', // Only refresh token is httpOnly
        });

        // The backend rotates refresh tokens, so the one we just used is dead.
        if (name === 'wave_refresh_token') event.locals.waveRefreshToken = value;
      }
    }

    return true;
  } catch (e) {
    if (isRedirect(e)) throw e;

    // Refresh failed, clear auth state
    clearWaveSession(event);
    return false;
  }
}

/**
 * Exchanges the current refresh token for a new token pair, updating
 * `event.locals` and forwarding the new cookies to the browser. On failure the
 * session is cleared and the user is treated as logged out.
 *
 * Runs at most once per request event: the backend rotates refresh tokens, so
 * parallel refreshes with the same token would invalidate each other. Every
 * caller after the first gets the first call's result.
 */
export function refreshWaveSession(event: RequestEvent, apiUrl: string): Promise<boolean> {
  const refreshToken = event.locals.waveRefreshToken;
  if (!refreshToken) return Promise.resolve(false);

  event.locals.waveSessionRefresh ??= doRefresh(event, apiUrl, refreshToken);
  return event.locals.waveSessionRefresh;
}

function withWaveAuth(event: RequestEvent, request: Request): Request {
  const accessToken = event.locals.waveAccessToken;
  const refreshToken = event.locals.waveRefreshToken;
  // Once a refresh has been attempted for this request, `event.locals` is the
  // only source of truth. The tokens the request came in with are either
  // superseded or were rejected, and sending them would fail the call again.
  const refreshAttempted = !!event.locals.waveSessionRefresh;

  // Set Authorization header as primary auth method
  if (accessToken) {
    request.headers.set('Authorization', `Bearer ${accessToken}`);
  } else if (refreshAttempted) {
    request.headers.delete('Authorization');
  }

  // Pass the browser's own cookies along, with our tokens taking precedence
  // (they're needed for the refresh endpoint, and as a backup to the header
  // above — and `event.locals` may hold fresher ones than the request does).
  //
  // SvelteKit only merges the incoming cookies in by itself when the target
  // is the app's host or a subdomain of it, and the internal Wave URL is
  // neither in deployed environments. Without this, anything the API reads
  // from a cookie is silently absent during SSR while working fine in the
  // browser — including the device ID the liveness checkpoint is bound to,
  // which makes every server-rendered request look like a brand new device.
  const cookies = new Map<string, string>();

  // Parsed off the raw header rather than `event.cookies.getAll()` to avoid
  // a decode/re-encode round trip on values we're only passing through.
  for (const pair of event.request.headers.get('cookie')?.split(';') ?? []) {
    const separator = pair.indexOf('=');
    if (separator === -1) continue;
    cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
  }

  if (refreshAttempted) {
    for (const name of WAVE_TOKEN_COOKIES) cookies.delete(name);
  }

  if (refreshToken) cookies.set('wave_refresh_token', refreshToken);
  if (accessToken) cookies.set('wave_access_token', accessToken);

  if (cookies.size > 0) {
    request.headers.set(
      'Cookie',
      [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
    );
  } else if (refreshAttempted) {
    request.headers.delete('Cookie');
  }

  return request;
}

/**
 * Sends a server-side request to the Wave API with the user's credentials.
 *
 * The session hook only checks the access token's expiry, so a token the API
 * no longer accepts (e.g. a revoked session) can still reach here. If the API
 * answers 401 while we hold a refresh token, the session is refreshed once and
 * the request is retried with the new access token.
 */
export async function fetchWithWaveAuth(
  event: RequestEvent,
  request: Request,
  fetch: typeof globalThis.fetch,
  apiUrl: string,
): Promise<Response> {
  const isRefreshCall = new URL(request.url).pathname === '/api/auth/token/refresh';
  const canRetry = !isRefreshCall && !!event.locals.waveRefreshToken;

  // A request body can only be read once, so keep a copy for the retry.
  const retryRequest = canRetry ? request.clone() : undefined;
  const sentAccessToken = event.locals.waveAccessToken;

  const res = await fetch(withWaveAuth(event, request));

  if (res.status !== 401 || !retryRequest) return res;

  await refreshWaveSession(event, apiUrl);

  // An earlier refresh in this request already issued the token that was just
  // rejected, so refreshing again wouldn't help. If the refresh failed instead,
  // the session is now cleared and the retry goes out anonymously, which still
  // works for endpoints that don't require a login.
  const newAccessToken = event.locals.waveAccessToken;
  if (newAccessToken && newAccessToken === sentAccessToken) return res;

  await res.body?.cancel();

  return fetch(withWaveAuth(event, retryRequest));
}
