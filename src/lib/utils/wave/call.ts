import { browser } from '$app/environment';
import getOptionalEnvVarPublic from '../get-optional-env-var/public';
import { getAccessJwt, getRefreshedAuthToken } from './auth';

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
  refreshOnUnauthorized = true,
) {
  if (!WAVE_API_URL) {
    throw new Error('Wave API URL is not configured.');
  }

  const res = await f(`${WAVE_API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessJwt()}`,
      ...(options.headers || {}),
    },
  });

  // if the response is 401, it means the token is invalid/expired, so we should try to refresh it
  if (res.status === 401 && refreshOnUnauthorized) {
    // try to refresh the token
    await getRefreshedAuthToken();

    // retry the original request with the new token
    return authenticatedCall(f, path, options, false);
  }

  return res;
}
