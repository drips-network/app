/* eslint-disable no-console */
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { PuppeteerManager } from '$lib/utils/puppeteer';
import { error, type Handle, type HandleFetch } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getUserData } from '$lib/utils/wave/auth';
import { fetchWithWaveAuth, refreshWaveSession } from '$lib/utils/wave/server-session';
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
        // Access token missing or invalid/expired, attempt refresh. Clears the
        // auth state if it fails.
        event.locals.waveRefreshToken = refreshToken;
        await refreshWaveSession(event, WAVE_API_URL);
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

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  // If the request is going to Wave API, attach auth credentials, refreshing
  // them once if the API rejects the access token.
  if (WAVE_API_URL && request.url.startsWith(WAVE_API_URL)) {
    return fetchWithWaveAuth(event, request, fetch, WAVE_API_URL);
  }

  return fetch(request);
};
