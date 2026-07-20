import { getWebInstrumentations, initializeFaro, type Faro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import getOptionalEnvVar from '../get-optional-env-var/public';

let faro: Faro | null = null;

export const init = () => {
  const FARO_ENABLED = getOptionalEnvVar('PUBLIC_FARO_ENABLED', false, null);
  const FARO_ENVIRONMENT = getOptionalEnvVar('PUBLIC_FARO_ENVIRONMENT', false, null);

  if (FARO_ENABLED === 'true' && FARO_ENVIRONMENT) {
    faro = initializeFaro({
      url: 'https://faro-collector-prod-eu-west-2.grafana.net/collect/0a4519657ebc92ca47d9271be5503b63',
      app: {
        name: 'app',
        version: '1.0.0',
        environment: FARO_ENVIRONMENT,
      },

      instrumentations: [
        // Mandatory, omits default instrumentations otherwise.
        ...getWebInstrumentations(),

        // Tracing package to get end-to-end visibility for HTTP requests.
        new TracingInstrumentation(),
      ],
    });
  }
};

/**
 * Forwards an error to Faro, if monitoring is active. No-ops when Faro isn't
 * initialized (e.g. the user hasn't consented to monitoring, or
 * `PUBLIC_FARO_ENABLED` is off), so it's always safe to call.
 *
 * Faro's default web instrumentation only captures errors that reach
 * `window.onerror` / `unhandledrejection`. SvelteKit catches errors thrown in
 * `load`/rendering itself, so those never surface to Faro unless we report them
 * explicitly from the client `handleError` hook.
 */
export const pushError = (error: Error, context?: Record<string, string>) => {
  faro?.api.pushError(error, context ? { context } : undefined);
};
