import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const env = loadEnv(process.env['NODE_ENV'] ?? 'development', process.cwd(), 'BUILD_');

const config = defineConfig({
  plugins: [sentrySvelteKit(), sveltekit()],
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
  define: {
    INJECTED_DEPLOY_URL: `${env.BUILD_DEPLOY_URL}`,
  },
});

export default config;
