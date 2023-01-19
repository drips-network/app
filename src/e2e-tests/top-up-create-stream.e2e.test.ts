/* eslint-disable no-console */

import { afterAll, beforeAll, describe } from 'vitest';
import { preview } from 'vite';
import type { PreviewServer } from 'vite';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { expect } from '@playwright/test';
import fetch from 'node-fetch';
import configureAppForTest from './helpers/configure-app-for-test';
import changeAddress from './helpers/change-address';

describe('top up, create stream, view profile, search', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    window.fetch = fetch as typeof window.fetch;

    server = await preview({ preview: { port: 3000 } });
    browser = await chromium.launch();
    page = await browser.newPage();

    page.on('console', (m) => console.log(m));

    await configureAppForTest(page);
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  describe('dashboard empty state', () => {
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
  });

  describe('top-up flow', () => {
    it('opens the top-up-flow', async () => {
      const topUpButton = page.locator('text=Add funds');
      await topUpButton.click();

      const topUpFlowDescription = page.locator(
        'text=Add any ERC-20 token to your Drips account in order to start streaming.',
      );
      await expect(topUpFlowDescription).toHaveCount(1);
    });

    it('adds the test ERC-20 as a new custom token', async () => {
      await page.locator('text=Add custom token').click();

      const warningText = page.locator(
        'text=You’re about to add a token which is not officially-supported',
      );
      await expect(warningText).toHaveCount(1);

      /*
      Wait a little bit because the stepper `sidestep` mechanism causes an extremely quick re-render of
      inputs when beginning a sidestep.
      */
      await page.waitForTimeout(1000);

      await page.type(
        'label:has-text("Token contract address*")',
        '0x9A676e781A523b5d0C0e43731313A708CB607508',
      );

      await page.locator('button', { hasText: 'Add custom token' }).click();
      await page.locator('button', { hasText: 'Got it' }).click();
    });

    it('displays the custom mock erc-20 token', async () => {
      const testcoin = page.locator('text=Testcoin');
      await testcoin.click();

      const topUpButton = page.locator('text=Add Testcoin');
      await topUpButton.click();
    });

    it('displays the amount step', async () => {
      await page.fill('label:has-text("Amount")', '50');
      await page.locator('data-testid=confirm-amount-button').click();
    });

    it('displays the approve step', async () => {
      await expect(page.locator('text=Approve token spend')).toHaveCount(1);
      await page.locator('text=Trigger approve transaction').click();
    });

    it('shows the topped-up amount on the dashboard', async () => {
      await expect(page.locator('text=50.00')).toHaveCount(2);
      await page.locator('text=Got it').click();
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
      await changeAddress(page, '0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

      await page.reload();

      await expect(page.locator('text=Dashboard')).toHaveCount(1);
    });

    it('displays the incoming stream', async () => {
      await expect(page.locator('text=↓ Incoming')).toHaveCount(1);
      await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
    });

    it('displays the incoming balance', async () => {
      await expect(page.locator('text=Testcoin')).toHaveCount(1);
    });
  });

  describe('profile view', () => {
    it('displays the original users outgoing stream on their profile', async () => {
      await page.goto('http://localhost:3000/app/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

      await expect(page.locator('text=↑ Outgoing')).toHaveCount(1);
      await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
    });

    it('displays the outgoing balance', async () => {
      await expect(page.locator('text=Testcoin')).toHaveCount(1);
    });

    it('switches to another user', async () => {
      await changeAddress(page, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
      await page.goto('http://localhost:3000/app/dashboard');

      await page.reload();

      await expect(page.locator('text=Dashboard')).toHaveCount(1);
    });

    it('displays the recipient users incoming stream on their profile', async () => {
      await page.goto('http://localhost:3000/app/0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

      await expect(page.locator('text=↓ Incoming')).toHaveCount(1);
      await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
    });

    it('displays the incoming balance', async () => {
      await expect(page.locator('text=Testcoin')).toHaveCount(1);
    });
  });

  describe('search', () => {
    it('opens the searchbar', async () => {
      const searchbar = page.locator('data-testid=searchbar');

      await searchbar.click();
    });

    it('finds streams', async () => {
      await page.keyboard.type('E2E');
      await expect(
        page.locator('.account-menu-item-wrapper', { hasText: 'E2E Test Stream' }),
      ).toHaveCount(1);
    });

    it('finds tokens', async () => {
      const searchbar = page.locator('data-testid=searchbar');

      await searchbar.fill('Test');

      await expect(page.locator('.account-menu-item-wrapper', { hasText: 'Testcoin' })).toHaveCount(
        1,
      );
    });

    it('jumps to profiles', async () => {
      const searchbar = page.locator('data-testid=searchbar');
      await searchbar.fill('0x');

      await page
        .locator('.account-menu-item-wrapper', {
          hasText: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        })
        .click();
      expect(page.url().toLowerCase()).toBe(
        'http://localhost:3000/app/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      );
    });
  });

  describe('stream detail view', () => {
    it('opens the stream detail view', async () => {
      await page.goto('http://localhost:3000/app/dashboard');
      await page.locator('text=E2E Test Stream').click();

      await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      await expect(page.locator('text=Active')).toHaveCount(1);
      await expect(page.locator('button', { hasText: 'Delete' })).toHaveCount(1);
      await expect(page.locator('button', { hasText: 'Pause' })).toHaveCount(1);
    });
  });

  let streamPausedAtTotalStreamed: string | null = null;
  let expectedRemainingTokenAmount: string | null = null;

  describe('pause and unpause', () => {
    it('pauses the stream', async () => {
      await page.locator('button', { hasText: 'Pause' }).click();
      await expect(page.locator('text=Your stream has been paused')).toHaveCount(1);
      await page.locator('button', { hasText: 'Got it' }).click();

      await expect(page.locator('text=Paused')).toHaveCount(1);
    }, 20000);

    it('unpauses the stream', async () => {
      await page.locator('button', { hasText: 'Unpause' }).click();
      await expect(page.locator('text=Your stream has been unpaused')).toHaveCount(1);
      await page.locator('button', { hasText: 'Got it' }).click();

      await expect(page.locator('text=Active')).toHaveCount(1);
    }, 20000);

    it('pauses the stream again', async () => {
      await page.locator('button', { hasText: 'Pause' }).click();
      await expect(page.locator('text=Your stream has been paused')).toHaveCount(1);
      await page.locator('button', { hasText: 'Got it' }).click();

      await expect(page.locator('text=Paused')).toHaveCount(1);

      streamPausedAtTotalStreamed = (
        await page.locator('data-testid=total-streamed').innerText()
      ).replace(' TEST', '');
      expectedRemainingTokenAmount = (50 - Number(streamPausedAtTotalStreamed)).toFixed(2);
    }, 20000);

    it('switches back to the user receiving the stream', async () => {
      await changeAddress(page, '0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
      await page.goto('http://localhost:3000/app/dashboard');

      await page.reload();

      await expect(page.locator('text=Dashboard')).toHaveCount(1);
    });

    it('displays the right incoming earned amount on the dashboard', async () => {
      await expect(page.locator(`text=${streamPausedAtTotalStreamed}`)).toHaveCount(2);
    });

    it('opens the stream detail view from the recipient perspective', async () => {
      await page.locator('text=E2E Test Stream').click();

      await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      await expect(page.locator('text=Paused')).toHaveCount(1);
      await expect(page.locator('button', { hasText: 'Delete' })).toHaveCount(0);
      await expect(page.locator('button', { hasText: 'Pause' })).toHaveCount(0);

      // Make sure that the inbound estimate matches that of the outgoing stream
      expect(await page.locator('data-testid=total-streamed').innerText()).toBe(
        `${streamPausedAtTotalStreamed} TEST`,
      );
    });
  });

  describe('delete stream', () => {
    it('switches back to the original user', async () => {
      await changeAddress(page, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
      await page.goto('http://localhost:3000/app/dashboard');

      await page.reload();

      await expect(page.locator('text=Dashboard')).toHaveCount(1);
    });

    it('displays the right streamed amount on the dashboard', async () => {
      await expect(page.locator(`text=${streamPausedAtTotalStreamed}`)).toHaveCount(1);
    });

    it('opens the stream detail view', async () => {
      await page.locator('text=E2E Test Stream').click();
      await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      await expect(page.locator('text=Paused')).toHaveCount(1);
      await expect(page.locator('button', { hasText: 'Delete' })).toHaveCount(1);
      await expect(page.locator('button', { hasText: 'Unpause' })).toHaveCount(1);
    });

    it('deletes the stream', async () => {
      await page.locator('button', { hasText: 'Delete ' }).click();
      await page.locator('button', { hasText: 'Delete stream' }).click();
      await page.locator('button', { hasText: 'Got it' }).click();

      expect(page.url().toLowerCase()).toBe('http://localhost:3000/app/dashboard');
    }, 20000);

    it('shows the streams empty state', async () => {
      const streamsEmptyState = page.locator('text=No streams');
      await expect(streamsEmptyState).toHaveCount(1);
    });

    it('still shows the balances section', async () => {
      await expect(page.locator(`text=${expectedRemainingTokenAmount}`)).toHaveCount(1);
    });

    it('switches back to the recipient', async () => {
      await changeAddress(page, '0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
      await page.goto('http://localhost:3000/app/dashboard');

      await page.reload();

      await expect(page.locator('text=Dashboard')).toHaveCount(1);
    });

    it('still shows the balances section for the recipient', async () => {
      await expect(page.locator(`text=${streamPausedAtTotalStreamed}`)).toHaveCount(1);
    });

    it('shows the streams empty state', async () => {
      const streamsEmptyState = page.locator('text=No streams');
      await expect(streamsEmptyState).toHaveCount(1);
    });
  });
});
