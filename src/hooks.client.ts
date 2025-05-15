import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export const init = () => {
  const FARO_ENABLED = getOptionalEnvVar('PUBLIC_FARO_ENABLED', false, null);
  const FARO_ENVIRONMENT = getOptionalEnvVar('PUBLIC_FARO_ENVIRONMENT', false, null);

  if (FARO_ENABLED === 'true' && FARO_ENVIRONMENT) {
    initializeFaro({
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
