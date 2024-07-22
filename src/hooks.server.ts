import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

const dsn = getOptionalEnvVar('PUBLIC_SENTRY_DSN');

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    integrations: [nodeProfilingIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: import.meta.env.DEV,
  });
}

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle());

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
