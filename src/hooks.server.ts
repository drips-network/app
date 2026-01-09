import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { PuppeteerManager } from '$lib/utils/puppeteer';
import z from 'zod';
import setCookieParser from 'set-cookie-parser';
import { error } from '@sveltejs/kit';

PuppeteerManager.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const WAVE_API_URL = getOptionalEnvVar(
  'PUBLIC_INTERNAL_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

export const handle = async ({ event, resolve }) => {
  // if we're under /wave path, perform access token refresh for Wave.
  // this allows the initial page render to be SSR even for logged-in-only views.

  if (event.url.pathname.startsWith('/wave') && WAVE_API_URL) {
    const refreshToken = event.cookies.get('wave_refresh_token', {});

    if (refreshToken) {
      event.locals.waveRefreshToken = refreshToken;

      try {
        const res = await fetch(`${WAVE_API_URL}/api/auth/token/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { Cookie: `wave_refresh_token=${refreshToken}` },
        });

        if (!res.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = z
          .object({
            accessToken: z.string(),
          })
          .parse(await res.json());

        event.locals.newWaveAccessToken = data.accessToken;

        for (const str of setCookieParser.splitCookiesString(res.headers.get('set-cookie') ?? '')) {
          const { name, value, ...options } = setCookieParser.parseString(str);

          if (name === 'wave_refresh_token') {
            // set the same cookie that was sent by the Wave API, same options as well
            event.cookies.set('wave_refresh_token', value, {
              ...options,
              sameSite: options.sameSite as 'lax' | 'strict' | 'none',
              path: options.path || '/',
            });
          }
        }
      } catch {
        // user is logged out, clear the cookies and render as logged out
        event.cookies.delete('wave_refresh_token', { path: '/' });
        delete event.locals.waveRefreshToken;
        delete event.locals.newWaveAccessToken;
      }
    }
  }

  try {
    return resolve(event);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Error during request handling:', e);

    throw error(500, 'Internal Server Error');
  }
};

export const handleFetch = async ({ event, request, fetch }) => {
  // if the request is going to Wave API, and we have a new access token in locals, add it to the request
  if (WAVE_API_URL && request.url.startsWith(WAVE_API_URL)) {
    const accessToken = event.locals.newWaveAccessToken;
    const refreshToken = event.locals.waveRefreshToken;

    request.headers.set('Authorization', accessToken ? `Bearer ${accessToken}` : '');
    request.headers.set('Cookie', `wave_refresh_token=${refreshToken}`);
  }

  // eslint-disable-next-line no-console
  console.log('Fetching:', request.url);

  const res = await fetch(request);

  // eslint-disable-next-line no-console
  console.log('fetched', {
    url: request.url,
    status: res.status,
    accessControl: res.headers.get('access-control-allow-origin'),
  });
  return res;
};
