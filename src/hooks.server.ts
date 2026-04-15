/* eslint-disable no-console */
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { PuppeteerManager } from '$lib/utils/puppeteer';
import z from 'zod';
import setCookieParser from 'set-cookie-parser';
import { error, isRedirect, redirect } from '@sveltejs/kit';
import { getUserData } from '$lib/utils/wave/auth';

PuppeteerManager.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const WAVE_API_URL = getOptionalEnvVar(
  'PUBLIC_INTERNAL_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

// Dedupes concurrent token refreshes keyed by the incoming refresh token.
// Backend rotates refresh tokens, so two SSR requests arriving at once with
// the same token would otherwise race — the loser would get 401, clear
// cookies, and log the user out. Entries are kept briefly after settling
// so a trailing request that was dispatched with the pre-rotation token
// still gets the cached result instead of re-racing.
type RefreshResult = { accessToken: string; setCookie: string };
const refreshInFlight = new Map<string, Promise<RefreshResult>>();
const REFRESH_CACHE_GRACE_MS = 5000;

function refreshWaveTokens(refreshToken: string): Promise<RefreshResult> {
  const existing = refreshInFlight.get(refreshToken);
  if (existing) return existing;

  const promise = (async () => {
    const res = await fetch(`${WAVE_API_URL}/api/auth/token/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Cookie: `wave_refresh_token=${refreshToken}` },
    });

    if (!res.ok) {
      const err = new Error('Failed to refresh token') as Error & {
        status?: number;
        body?: string;
      };
      err.status = res.status;
      err.body = await res.text();
      throw err;
    }

    const { accessToken } = z.object({ accessToken: z.string() }).parse(await res.json());

    return { accessToken, setCookie: res.headers.get('set-cookie') ?? '' };
  })();

  refreshInFlight.set(refreshToken, promise);

  const clear = () => {
    setTimeout(() => {
      if (refreshInFlight.get(refreshToken) === promise) {
        refreshInFlight.delete(refreshToken);
      }
    }, REFRESH_CACHE_GRACE_MS);
  };
  promise.then(clear, clear);

  return promise;
}

export const handle = async ({ event, resolve }) => {
  // If we're under /wave path, handle Wave authentication.
  // This allows the initial page render to be SSR even for logged-in-only views.

  if (event.url.pathname.startsWith('/wave') && WAVE_API_URL) {
    const refreshToken = event.cookies.get('wave_refresh_token', {});
    const accessToken = event.cookies.get('wave_access_token', {});

    if (refreshToken) {
      // Check if access token is valid and not expired
      const userData = accessToken ? getUserData(accessToken) : null;

      if (userData) {
        // Access token still valid, use it directly (no refresh needed)
        event.locals.waveRefreshToken = refreshToken;
        event.locals.waveAccessToken = accessToken;
      } else {
        // Access token missing or invalid/expired, attempt refresh
        try {
          const { accessToken: newAccessToken, setCookie } = await refreshWaveTokens(refreshToken);

          event.locals.waveRefreshToken = refreshToken;
          event.locals.waveAccessToken = newAccessToken;

          // Forward new cookies to browser
          for (const str of setCookieParser.splitCookiesString(setCookie)) {
            const { name, value, ...options } = setCookieParser.parseString(str);

            if (name === 'wave_refresh_token' || name === 'wave_access_token') {
              event.cookies.set(name, value, {
                ...options,
                sameSite: options.sameSite as 'lax' | 'strict' | 'none',
                path: options.path || '/',
                httpOnly: name === 'wave_refresh_token', // Only refresh token is httpOnly
              });
              if (name === 'wave_refresh_token') {
                event.locals.waveRefreshToken = value;
              }
            }
          }
        } catch (e) {
          if (isRedirect(e)) throw e;

          const status = (e as { status?: number }).status;
          const body = (e as { body?: string }).body ?? '';
          if (status === 403 && body.includes('suspended')) {
            event.cookies.delete('wave_refresh_token', { path: '/' });
            event.cookies.delete('wave_access_token', { path: '/' });
            throw redirect(302, '/wave/suspended');
          }

          // Refresh failed, clear auth state
          event.cookies.delete('wave_refresh_token', { path: '/' });
          event.cookies.delete('wave_access_token', { path: '/' });
          delete event.locals.waveRefreshToken;
          delete event.locals.waveAccessToken;
        }
      }
    }
  }

  try {
    return resolve(event, {
      filterSerializedResponseHeaders(name) {
        if (name === 'content-type') return true;

        return false;
      },
    });
  } catch (e) {
    console.log('Error during request handling:', e);

    throw error(500, 'Internal Server Error');
  }
};

export const handleFetch = async ({ event, request, fetch }) => {
  // If the request is going to Wave API, attach auth credentials
  if (WAVE_API_URL && request.url.startsWith(WAVE_API_URL)) {
    const accessToken = event.locals.waveAccessToken;
    const refreshToken = event.locals.waveRefreshToken;

    // Set Authorization header as primary auth method
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // Also set cookies (needed for refresh endpoint and as backup)
    const cookies = [
      refreshToken && `wave_refresh_token=${refreshToken}`,
      accessToken && `wave_access_token=${accessToken}`,
    ]
      .filter(Boolean)
      .join('; ');

    if (cookies) {
      request.headers.set('Cookie', cookies);
    }
  }

  return fetch(request);
};
