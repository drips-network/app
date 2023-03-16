import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const config = defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/app',
      manifest: {
        short_name: 'Drips',
        name: 'Drips',
        id: '/app?homescreen=1',
        start_url: '/app?homescreen=1',
        background_color: '#0E171F',
        display: 'minimal-ui',
        scope: '/app',
        theme_color: '#5555FF',
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: "View your account's dashboard with balances, streams and splits.",
            url: '/app/dashboard',
            icons: [{ src: '/icons/dashboard.png', sizes: '256x256' }],
          },
          {
            name: 'Settings',
            short_name: 'Settings',
            description: 'Adjust settings for the Drips app.',
            url: '/app/settings',
            icons: [{ src: '/icons/settings.png', sizes: '256x256' }],
          },
        ],
        icons: [
          {
            src: '/icons/icon.svg',
            type: 'image/svg+xml',
            sizes: '192x192',
          },
          {
            src: '/icons/icon-192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/icons/icon-512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        description: 'Crowdfunding for the Open Web',
      },
    }),
  ],
  test: {
    // Jest like globals
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./setup-test.js'],
    deps: {
      inline: ['@ethersproject/signing-key', '@ethersproject/basex', '@depay/solana-web3.js'],
    },
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
});

export default config;
