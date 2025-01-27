import { sequence } from '@sveltejs/kit/hooks';
import { sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { PuppeteerManager } from '$lib/utils/puppeteer';

const dsn = getOptionalEnvVar('PUBLIC_SENTRY_DSN', false, null);

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    integrations: [nodeProfilingIntegration()],
  });
}

PuppeteerManager.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

export const handle = sequence(sentryHandle());
export const handleError = Sentry.handleErrorWithSentry(function (error: unknown) {
  // eslint-disable-next-line no-console
  console.error('Uncaught error', error);
});
