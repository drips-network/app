import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import getOptionalEnvVarPublic from '../get-optional-env-var/public';
import { getRefreshedAuthToken } from './auth';

export class AccountSuspendedError extends Error {
  constructor() {
    super('Account suspended');
    this.name = 'AccountSuspendedError';
  }
}

/**
 * Thrown for 403 responses where the backend signals that the account is in a
 * "restricted" state (lighter than a full ban — login still works, but
 * specific actions like applying to issues / repos are blocked).
 */
export class AccountRestrictedError extends Error {
  constructor() {
    super('Your account is currently restricted from this action.');
    this.name = 'AccountRestrictedError';
  }
}

/**
 * Thrown for 403 responses where the API is holding the request until the user
 * completes a short identity check.
 *
 * Route guards normally catch this before the request is made, so seeing it
 * means a check fell due mid-session. Callers should send the user to
 * /wave/checkpoint rather than surfacing a generic error.
 */
export class LivenessCheckpointRequiredError extends Error {
  constructor() {
    super('A quick identity check is needed before you can continue.');
    this.name = 'LivenessCheckpointRequiredError';
  }
}

/**
 * Thrown for 403 responses where the backend rejects a login or token refresh
 * because the user's GitHub primary email address is unverified. Callers
 * should send the user to /wave/unverified-email, which explains how to
 * verify the address on GitHub.
 */
export class UnverifiedEmailError extends Error {
  constructor() {
    super("Your GitHub account's primary email address is not verified.");
    this.name = 'UnverifiedEmailError';
  }
}

function isAccountSuspendedResponse(status: number, body: string): boolean {
  return status === 403 && body.includes('suspended');
}

function isAccountRestrictedResponse(status: number, body: string): boolean {
  return status === 403 && body.includes('restricted');
}

// Matched on the machine-readable `code` the backend sets rather than the
// prose, which is free to change.
function isCheckpointRequiredResponse(status: number, body: string): boolean {
  return status === 403 && body.includes('liveness_checkpoint_required');
}

// Matched on the machine-readable `code` the backend sets rather than the
// prose, which is free to change.
function isUnverifiedEmailResponse(status: number, body: string): boolean {
  return status === 403 && body.includes('unverified_email');
}

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

export const PUBLIC_WAVE_API_URL = getOptionalEnvVarPublic(
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

    // The machine-readable code match runs before the bare-word ones so prose
    // containing "suspended"/"restricted" can't shadow it.
    if (isUnverifiedEmailResponse(response.status, errorText)) {
      throw new UnverifiedEmailError();
    }

    if (isAccountSuspendedResponse(response.status, errorText)) {
      throw new AccountSuspendedError();
    }

    if (isAccountRestrictedResponse(response.status, errorText)) {
      throw new AccountRestrictedError();
    }

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

      // The machine-readable code match runs before the bare-word ones so
      // prose containing "suspended"/"restricted" can't shadow it. The
      // unverified-email code is only set on login and token refresh, which go
      // through call() and the server hook, so it is not matched here — an
      // unhandled UnverifiedEmailError in an SSR load would surface as a 500
      // instead of the 403 page.
      if (isCheckpointRequiredResponse(res.status, errorText)) {
        throw new LivenessCheckpointRequiredError();
      }

      if (isAccountSuspendedResponse(res.status, errorText)) {
        throw new AccountSuspendedError();
      }

      if (isAccountRestrictedResponse(res.status, errorText)) {
        throw new AccountRestrictedError();
      }

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
