/* eslint-disable no-console */
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import faroUploader from '@grafana/faro-rollup-plugin';
import devtoolsJson from 'vite-plugin-devtools-json';
import { keystatic } from 'keystatic-sveltekit';

if (process.env.FARO_UPLOAD_SOURCE_MAPS_KEY) {
  console.log('👀 - FARO_UPLOAD_SOURCE_MAPS_KEY is set, enabling source map upload');
} else {
  console.log('👀 - FARO_UPLOAD_SOURCE_MAPS_KEY is not set, skipping source map upload');
}

const config = defineConfig(({ mode }) => ({
  plugins: [
    devtoolsJson(),
    keystatic(),
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
    // Bind to 127.0.0.1 (not just localhost) so the Keystatic admin UI's
    // hard-coded redirect to 127.0.0.1 works in dev. Quirk documented in
    // keystatic-sveltekit's README; remove once Thinkmill/keystatic#1465 lands.
    host: '127.0.0.1',
  },
}));

export default config;
