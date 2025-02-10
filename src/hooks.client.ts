import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import {
  browserProfilingIntegration,
  handleErrorWithSentry,
  replayIntegration,
} from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

const dsn = getOptionalEnvVar('PUBLIC_SENTRY_DSN', false, null);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [replayIntegration(), browserProfilingIntegration()],
  });
}

export const handleError = handleErrorWithSentry();
