/* eslint-disable no-console */
import { preview, type PreviewServer } from 'vite';
import configureAppForTest from './helpers/configure-app-for-test';
import { chromium, type Browser, type Page } from 'playwright';
import { expect } from '@playwright/test';

describe.skip('multiplayer', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    window.fetch = fetch as unknown as typeof window.fetch;

    server = await preview({
      preview: { port: 3001, host: '0.0.0.0' },
    });
    browser = await chromium.launch({ headless: process.env.E2E_HEADLESS === '0' ? false : true });
    page = await browser.newPage();

    page.on('console', (msg) => console.log(msg.text()));

    await configureAppForTest(page);
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  describe('navigate to drip list creation flow', () => {
    it('opens up to explore tab', async () => {
      await page.goto('http://127.0.0.1:3001/app');
      await expect(page.locator('text=Stats')).toHaveCount(1);
    });

    it('goes to the drip lists page', async () => {
      await page.locator('div[data-testid="sidenav"] a:text("Drip Lists")').click();
    });

    it('opens up drip list creation flow', async () => {
      await page.locator('text=Create Drip List').click();

      await expect(page.locator('h1:has-text("Create a Drip List")')).toHaveCount(1);
    });

    it('selects collaborate option', async () => {
      await page.locator('text=Collaborate on recipients').click();
      await page.locator('text=Continue').click();

      await expect(page.locator('h1:has-text("Collaborative list")')).toHaveCount(1);
    });

    it('fills a collaborator', async () => {
      await page.locator('input[placeholder="ETH address"]').click();

      await page.keyboard.type('0xAa90c43123ACEc193A35D33db5D71011B019779D');
      await page.locator('text=Add').click();
    });

    it('fills voting end date', async () => {
      await page.locator('input[placeholder="YYYY-MM-DD HH:MM:SS"]').click();

      const date = new Date();
      date.setDate(date.getDate() + 7);

      await page.keyboard.type(`${date.toISOString().split('T')[0]} 00:00:00`);

      await page.locator('text=Continue').click();
    });

    it('creates the collab. drip list', async () => {
      await page.locator('text=Confirm in wallet').click();

      await page.waitForTimeout(5000);
    });
  });
});
