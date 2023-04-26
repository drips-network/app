import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/',
    port: 4173,
  },
  use: {
    baseURL: 'http://localhost:4173/',
  },
};

export default config;
