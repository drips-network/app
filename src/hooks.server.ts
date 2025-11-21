import getOptionalEnvVar from '$lib/utils/get-optional-env-var/private';
import { PuppeteerManager } from '$lib/utils/puppeteer';
import z from 'zod';
import setCookieParser from 'set-cookie-parser';

PuppeteerManager.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const WAVE_API_URL = getOptionalEnvVar(
  'INTERNAL_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

export const handle = async ({ event, resolve }) => {
  // if we're under /wave path, perform access token refresh for Wave.
  // this allows the initial page render to be SSR even for logged-in-only views.

  if (event.url.pathname.startsWith('/wave') && WAVE_API_URL) {
    const refreshToken = event.cookies.get('wave_refresh_token');

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
            event.cookies.set('wave_refresh_token', value, {
              path: '/',
              httpOnly: true,
              secure: event.url.protocol === 'https:', // false on localhost usually
              sameSite: 'lax',
              maxAge: options.maxAge,
            });
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to refresh Wave access token:', e);
      }
    }
  }

  return resolve(event);
};

export const handleFetch = async ({ event, request, fetch }) => {
  // if the request is going to Wave API, and we have a new access token in locals, add it to the request
  if (WAVE_API_URL && request.url.startsWith(WAVE_API_URL)) {
    const accessToken = event.locals.newWaveAccessToken;
    const refreshToken = event.locals.waveRefreshToken;

    request.headers.set('Authorization', `Bearer ${accessToken}`);
    request.headers.set('Cookie', `wave_refresh_token=${refreshToken}`);
  }

  return fetch(request);
};
