import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const config = defineConfig({
  plugins: [sveltekit()],
  test: {
    // Jest like globals
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['src/e2e-tests/.tmp/**'],
    setupFiles: ['./setup-test.js'],
    server: {
      deps: {
        inline: ['cupertino-pane'],
      },
    },
    testTimeout: 7000,
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    exclude: ['radicle-design-system'],
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
