import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: 4,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',

  use: {
    trace: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    {
      name: 'safari',
      use: {
        ...devices['Desktop Safari'],
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
  ],
});
