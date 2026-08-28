/* eslint-disable no-console */
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { PuppeteerManager } from '$lib/utils/puppeteer';
import z from 'zod';
import setCookieParser from 'set-cookie-parser';
import { error, isRedirect, redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getUserData } from '$lib/utils/wave/auth';
import network from '$lib/stores/wallet/network';

PuppeteerManager.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const WAVE_API_URL = getOptionalEnvVar(
  'PUBLIC_INTERNAL_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

const waveHandle: Handle = async ({ event, resolve }) => {
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
          const res = await fetch(`${WAVE_API_URL}/api/auth/token/refresh`, {
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
                event.cookies.delete('wave_refresh_token', { path: '/' });
                event.cookies.delete('wave_access_token', { path: '/' });
                throw redirect(302, '/wave/unverified-email');
              }
              if (body.includes('suspended')) {
                event.cookies.delete('wave_refresh_token', { path: '/' });
                event.cookies.delete('wave_access_token', { path: '/' });
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
          for (const str of setCookieParser.splitCookiesString(
            res.headers.get('set-cookie') ?? '',
          )) {
            const parsed = setCookieParser.parseString(str);
            if (!parsed) continue;
            const { name, value, ...options } = parsed;

            if (name === 'wave_refresh_token' || name === 'wave_access_token') {
              event.cookies.set(name, value, {
                ...options,
                sameSite: options.sameSite as 'lax' | 'strict' | 'none',
                path: options.path || '/',
                httpOnly: name === 'wave_refresh_token', // Only refresh token is httpOnly
              });
            }
          }
        } catch (e) {
          if (isRedirect(e)) throw e;

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

// The blog (and therefore the CMS) only lives on the mainnet deployment.
// On alt-chain deployments the CMS routes 404 and neither keystatic-sveltekit
// nor the config is ever imported — the dynamic imports below only fire the
// first time a CMS request lands on the mainnet deployment.
const isKeystaticPath = (path: string) =>
  path.startsWith('/keystatic') || path.startsWith('/api/keystatic');

let keystaticHandlePromise: Promise<Handle> | undefined;
const getKeystaticHandle = () => {
  keystaticHandlePromise ??= (async () => {
    const [{ handleKeystatic }, { default: keystaticConfig }] = await Promise.all([
      import('keystatic-sveltekit'),
      import('../keystatic.config'),
    ]);
    return handleKeystatic({ config: keystaticConfig });
  })();
  return keystaticHandlePromise;
};

const guardedKeystaticHandle: Handle = async ({ event, resolve }) => {
  if (!isKeystaticPath(event.url.pathname)) return resolve(event);
  if (network.alternativeChainMode) throw error(404, 'Not found');
  const handler = await getKeystaticHandle();
  return handler({ event, resolve });
};

export const handle = sequence(guardedKeystaticHandle, waveHandle);

export const handleFetch = async ({ event, request, fetch }) => {
  // If the request is going to Wave API, attach auth credentials
  if (WAVE_API_URL && request.url.startsWith(WAVE_API_URL)) {
    const accessToken = event.locals.waveAccessToken;
    const refreshToken = event.locals.waveRefreshToken;

    // Set Authorization header as primary auth method
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
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

    if (refreshToken) cookies.set('wave_refresh_token', refreshToken);
    if (accessToken) cookies.set('wave_access_token', accessToken);

    if (cookies.size > 0) {
      request.headers.set(
        'Cookie',
        [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
      );
    }
  }

  return fetch(request);
};
