import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import getOptionalEnvVarPublic from '../get-optional-env-var/public';
import { getRefreshedAuthToken } from './auth';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 500;

function isRetryableError(err: unknown): boolean {
  if (err instanceof TypeError && err.message.includes('fetch')) {
    // Network errors like "Failed to fetch"
    return true;
  }
  return false;
}

function isRetryableStatus(status: number): boolean {
  // Retry on server errors and rate limiting
  return status >= 500 || status === 429;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PUBLIC_WAVE_API_URL = getOptionalEnvVarPublic(
  'PUBLIC_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

const INTERNAL_WAVE_API_URL = getOptionalEnvVarPublic(
  'PUBLIC_INTERNAL_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

const WAVE_API_URL = browser ? PUBLIC_WAVE_API_URL : INTERNAL_WAVE_API_URL;

export async function call(path: string, options: RequestInit = {}) {
  if (!WAVE_API_URL) {
    throw new Error('Wave API URL is not configured.');
  }

  const response = await fetch(`${WAVE_API_URL}${path}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

export async function authenticatedCall(
  f = fetch,
  path: string,
  options: RequestInit = {},
  refreshOnUnauthorized = browser,
) {
  if (!WAVE_API_URL) {
    throw new Error('Wave API URL is not configured.');
  }

  const method = options.method?.toUpperCase() ?? 'GET';
  const isGetRequest = method === 'GET';

  let lastError: unknown;

  for (let attempt = 0; attempt <= (isGetRequest ? MAX_RETRIES : 0); attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 500ms, 1000ms, 2000ms
      await sleep(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1));
    }

    let res: Response;

    try {
      res = await f(`${WAVE_API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...(options.headers || {}),
        },
      });
    } catch (err) {
      // Network error (e.g., "Failed to fetch")
      if (isGetRequest && isRetryableError(err) && attempt < MAX_RETRIES) {
        lastError = err;
        continue;
      }
      throw err;
    }

    // Retry on 5xx or 429 for GET requests
    if (isGetRequest && isRetryableStatus(res.status) && attempt < MAX_RETRIES) {
      lastError = new Error(`API call failed: ${res.status} ${res.statusText}`);
      continue;
    }

    // if the response is 401, it means the token is invalid/expired, so we should try to refresh it
    if (res.status === 401 && refreshOnUnauthorized) {
      // try to refresh the token
      await getRefreshedAuthToken();

      // retry the original request with the new token
      return authenticatedCall(f, path, options, false);
    } else if ((!res.ok && res.status !== 404) || res.status === 403) {
      const errorText = await res.text();

      if (res.status === 401) {
        throw error(401, 'Unauthorized');
      }

      if (res.status === 403) {
        throw error(403, 'Forbidden');
      }

      throw new Error(`API call failed: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res;
  }

  // If we exhausted all retries, throw the last error
  throw lastError;
}
