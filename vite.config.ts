/* eslint-disable no-console */

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import faroUploader from '@grafana/faro-rollup-plugin';

if (process.env.FARO_UPLOAD_SOURCE_MAPS_KEY) {
  console.log('👀 - FARO_UPLOAD_SOURCE_MAPS_KEY is set, enabling source map upload');
} else {
  console.log('👀 - FARO_UPLOAD_SOURCE_MAPS_KEY is not set, skipping source map upload');
}

const config = defineConfig({
  plugins: [
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
    deps: {
      inline: [
        '@ethersproject/signing-key',
        '@ethersproject/basex',
        '@depay/solana-web3.js',
        'cupertino-pane',
      ],
    },
    testTimeout: 7000,
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  preview: {
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      // Required for octokit.
      'node-fetch': 'isomorphic-fetch',
    },
  },
});

export default config;
