/* eslint-disable no-console */

import { afterAll, beforeAll, describe } from 'vitest';
import { preview } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { expect } from '@playwright/test';
import fetch from 'node-fetch';

describe('top up, create stream', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    window.fetch = fetch as typeof window.fetch;

    server = await preview({ preview: { port: 3000 } });
    browser = await chromium.launch();
    page = await browser.newPage();

    await page.addInitScript(`
      window.isPlaywrightTest = true;
      window.playwrightAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

      localStorage.setItem('custom-tokens', JSON.stringify([
        {
          "source": "custom",
          "banned": false,
          "info": {
            "chainId": 5,
            "address": "0x9A676e781A523b5d0C0e43731313A708CB607508",
            "name": "Testcoin",
            "decimals": 18,
            "symbol": "TEST"
          }
        }
      ]));
    `);
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  describe('top-up flow', () => {
    it('connects', async () => {
      await page.goto('http://localhost:3000/app/dashboard');

      const dashboardHeadline = page.locator('text=Dashboard');
      await expect(dashboardHeadline).toHaveCount(1);
    });

    it('shows dashboard empty states', async () => {
      const tokensEmptyState = page.locator('text=No tokens');
      await expect(tokensEmptyState).toHaveCount(1);

      const streamsEmptyState = page.locator('text=No streams');
      await expect(streamsEmptyState).toHaveCount(1);
    });

    it('opens the top-up-flow', async () => {
      const topUpButton = page.locator('text=Top up');
      await topUpButton.click();

      const topUpFlowDescription = page.locator(
        'text=Add funds to your Drips account in order to start streaming.',
      );
      await expect(topUpFlowDescription).toHaveCount(1);
    });

    it('displays the custom mock erc-20 token', async () => {
      const testcoin = page.locator('text=Testcoin');
      await testcoin.click();

      const topUpButton = page.locator('text=Top up Testcoin');
      await topUpButton.click();
    });

    it('displays the amount step', async () => {
      await page.fill('label:has-text("Amount")', '100');
      await page.locator('text=Top up 100 TEST').click();
    });

    it('displays the approve step', async () => {
      await expect(page.locator('text=Approve token spend')).toHaveCount(1);
      await page.locator('text=Trigger approve transaction').click();
    });

    it('shows the topped-up amount on the dashboard', async () => {
      await expect(page.locator('text=100.00')).toHaveCount(1);
      // await page.screenshot({ fullPage: true, path: 'shot.png' });
      await page.locator('text=Close').click();
    });
  });

  describe('create stream flow', () => {
    it('opens the create stream modal', async () => {
      await page.locator('text=Create stream').click();

      await expect(
        page.locator('text=Stream any ERC-20 token to anyone with an Ethereum address.'),
      ).toHaveCount(1);
    });

    it('allows selecting the available outbound TEST balance', async () => {
      await page.locator('.label:has-text("Testcoin")').click();
    });

    it('allows submitting the create stream flow', async () => {
      await page.fill('label:has-text("Stream name*")', 'E2E Test Stream');
      await page.fill('label:has-text("Stream to*")', '0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
      await page.fill('label:has-text("Stream rate*")', '1');

      await page.locator('.modal button:has-text("Create stream")').click();
    });

    it('creates the stream', async () => {
      await expect(page.locator('text=No streams')).toHaveCount(0);
      await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
    });

    it('switches to another user', async () => {
      await page.addInitScript(`
        window.playwrightAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
      `);

      await page.reload();

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'shot.png', fullPage: true });

      expect(page.locator('text=Dashboard')).toBeDefined();
      expect(page.locator('text=7099—79c8')).toBeDefined();
    });

    it('displays the incoming stream', async () => {
      expect(page.locator('text=Incoming')).toBeDefined();
      expect(page.locator('text=E2E Test Stream')).toBeDefined();
    });

    it('displays the incoming balance', async () => {
      expect(page.locator('text=Testcoin')).toBeDefined();
    });
  });
});
