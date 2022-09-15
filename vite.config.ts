import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const config = defineConfig({
  plugins: [sveltekit()],
  test: {
    // Jest like globals
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./setup-test.js'],
    deps: {
      inline: ['@ethersproject/signing-key', '@ethersproject/basex'],
    },
  },
});

export default config;
