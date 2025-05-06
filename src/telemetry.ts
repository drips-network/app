/* eslint-disable no-console */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT === undefined) {
  console.warn('OTEL_EXPORTER_OTLP_ENDPOINT is not set. Skipping telemetry initialization.');
}
if (process.env.OTEL_SERVICE_NAME === undefined) {
  console.warn('OTEL_SERVICE_NAME is not set. Skipping telemetry initialization.');
}

const requiredEnvVarsSet =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT !== undefined &&
  process.env.OTEL_SERVICE_NAME !== undefined;

if (requiredEnvVarsSet) {
  const TRACE_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces';
  const METRICS_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/metrics';
  const SERVICE_NAME = process.env.OTEL_SERVICE_NAME;

  console.log('👀 Telemetry initialized with the following settings:');
  console.log('  OTEL_EXPORTER_OTLP_ENDPOINT:', TRACE_URL);
  console.log('  OTEL_SERVICE_NAME:', SERVICE_NAME);
  console.log('  OTEL_RESOURCE_ATTRIBUTES:', process.env.OTEL_RESOURCE_ATTRIBUTES);

  const traceExporter = new OTLPTraceExporter({
    url: TRACE_URL,
    headers: {},
  });

  const metricsExporter = new OTLPMetricExporter({
    url: METRICS_URL,
    headers: {},
  });

  const sdk = new NodeSDK({
    autoDetectResources: true,
    serviceName: SERVICE_NAME,
    traceExporter: traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricsExporter,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: (request) => {
            if (
              request.url?.endsWith('.svg') ||
              request.url?.endsWith('.js') ||
              request.url?.endsWith('.css') ||
              request.url?.endsWith('.png') ||
              request.url?.endsWith('.jpg') ||
              request.url?.endsWith('.jpeg') ||
              request.url?.endsWith('.gif') ||
              request.url?.endsWith('.ico') ||
              request.url?.endsWith('.woff') ||
              request.url?.endsWith('.woff2') ||
              request.url?.endsWith('.ttf') ||
              request.url?.endsWith('.eot') ||
              request.url?.endsWith('.otf') ||
              request.url?.endsWith('.webp') ||
              request.url?.endsWith('.mp4') ||
              request.url?.endsWith('.mp3') ||
              request.url?.endsWith('.wav')
            ) {
              return true;
            }
            return false;
          },
        },
      }),
    ],
  });

  sdk.start();
}
