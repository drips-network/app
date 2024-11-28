import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { PuppeteerManager } from '$lib/utils/puppeteer';

const dsn = getOptionalEnvVar('PUBLIC_SENTRY_DSN');

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    integrations: [nodeProfilingIntegration()],
  });
}

PuppeteerManager.launch({
  // Dockerfile deployment requires different executablePath
  ...(process.env.NODE_ENV === 'production' && {
    executablePath: '/usr/bin/google-chrome-stable',
  }),
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

export const handle = sequence(sentryHandle());
export const handleError = handleErrorWithSentry();
