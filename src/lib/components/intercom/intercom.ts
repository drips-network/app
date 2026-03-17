import { getIntercomJwt, type WaveLoggedInUser } from '$lib/utils/wave/auth';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import Intercom, { shutdown } from '@intercom/messenger-js-sdk';
import type { InitType } from '@intercom/messenger-js-sdk/dist/types';
import cookieManager, {
  ConsentType,
} from '$lib/components/wave/cookie-consent-banner/cookie-manager.svelte';

export const INTERCOM_APP_ID = getOptionalEnvVar(
  'PUBLIC_INTERCOM_APP_ID',
  true,
  'Intercom will not work',
);

let initialized = false;

export async function initIntercom(user: WaveLoggedInUser | null) {
  if (!INTERCOM_APP_ID) return;

  let jwt: string | null = null;

  if (user) {
    jwt = (await getIntercomJwt()).token;
  }

  const intercomSettings: InitType = {
    app_id: INTERCOM_APP_ID,
    region: 'eu',
    hide_default_launcher: true,
  };

  if (jwt) {
    intercomSettings.intercom_user_jwt = jwt;
  }

  Intercom(intercomSettings);
  initialized = true;
}

export function shutdownIntercom() {
  if (!initialized) return;

  shutdown();
  initialized = false;
}

export function isIntercomInitialized() {
  return initialized;
}

/**
 * Ensure Intercom cookies are consented to, then initialize Intercom if needed.
 * Call this when a user explicitly triggers an Intercom feature.
 */
export async function ensureIntercom(user: WaveLoggedInUser | null) {
  if (!cookieManager) return;

  if (!cookieManager.consentMap[ConsentType.INTERCOM]) {
    cookieManager.setConsent(ConsentType.INTERCOM, true);
  }

  if (!initialized) {
    await initIntercom(user);
  }
}
