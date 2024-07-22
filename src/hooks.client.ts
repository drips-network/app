import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import {
  browserProfilingIntegration,
  handleErrorWithSentry,
  replayIntegration,
} from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

const dsn = getOptionalEnvVar('PUBLIC_SENTRY_DSN');

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // If you don't want to use Session Replay, just remove the line below:
    integrations: [replayIntegration(), browserProfilingIntegration()],
  });
}

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
