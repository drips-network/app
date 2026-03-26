/* eslint-disable no-console */
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import faroUploader from '@grafana/faro-rollup-plugin';
import devtoolsJson from 'vite-plugin-devtools-json';

if (process.env.FARO_UPLOAD_SOURCE_MAPS_KEY) {
  console.log('👀 - FARO_UPLOAD_SOURCE_MAPS_KEY is set, enabling source map upload');
} else {
  console.log('👀 - FARO_UPLOAD_SOURCE_MAPS_KEY is not set, skipping source map upload');
}

const config = defineConfig(({ mode }) => ({
  ssr: {
    // Lit Protocol packages are ~845MB and only used server-side.
    // Externalizing them avoids Vite trying to bundle/analyze them, which causes OOM on CI.
    external: [
      '@lit-protocol/access-control-conditions',
      '@lit-protocol/access-control-conditions-schemas',
      '@lit-protocol/accs-schemas',
      '@lit-protocol/auth',
      '@lit-protocol/auth-helpers',
      '@lit-protocol/constants',
      '@lit-protocol/contracts',
      '@lit-protocol/crypto',
      '@lit-protocol/lit-client',
      '@lit-protocol/logger',
      '@lit-protocol/nacl',
      '@lit-protocol/networks',
      '@lit-protocol/schemas',
      '@lit-protocol/types',
      '@lit-protocol/uint8arrays',
      '@lit-protocol/wasm',
    ],
  },
  plugins: [
    devtoolsJson(),
    sveltekit(),
    process.env.FARO_UPLOAD_SOURCE_MAPS_KEY
      ? faroUploader({
          appName: 'app',
          endpoint: 'https://faro-api-prod-eu-west-2.grafana.net/faro/api/v1',
          appId: '2936',
          stackId: '1238676',
          apiKey: process.env.FARO_UPLOAD_SOURCE_MAPS_KEY,
          gzipContents: true,
        })
      : undefined,
  ],
  test: {
    // Jest like globals
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['src/e2e-tests/.tmp/**'],
    setupFiles: ['./setup-test.js'],
    testTimeout: 7000,
  },
  resolve: {
    conditions: mode === 'unit-test' ? ['browser'] : undefined,
    alias: {
      // Required for octokit.
      'node-fetch': 'isomorphic-fetch',
    },
  },
  preview: {
    host: '0.0.0.0',
  },
  server: {
    // required for local env
    allowedHosts: ['app'],
  },
}));

export default config;
