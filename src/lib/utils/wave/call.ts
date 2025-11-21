import { browser } from '$app/environment';
import getOptionalEnvVarPublic from '../get-optional-env-var/public';

const PUBLIC_WAVE_API_URL = getOptionalEnvVarPublic(
  'PUBLIC_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

const INTERNAL_WAVE_API_URL = await (async () => {
  if (browser) return null;

  return await import('$lib/utils/get-optional-env-var/private').then(
    ({ default: getOptionalEnvVarInternal }) => {
      return getOptionalEnvVarInternal(
        'INTERNAL_WAVE_API_URL',
        true,
        'Wave functionality will not work.',
      );
    },
  );
})();

const WAVE_API_URL = INTERNAL_WAVE_API_URL || PUBLIC_WAVE_API_URL;

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
