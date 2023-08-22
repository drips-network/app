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
import environment from './helpers/environment';

describe('app', async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    window.fetch = fetch as typeof window.fetch;

    server = await preview({
      preview: { port: 3000, host: '0.0.0.0' },
    });
    browser = await chromium.launch();
    page = await browser.newPage();

    await configureAppForTest(page);
  });

  beforeAll(environment.start, 14400000);
  afterAll(environment.stop, 14400000);

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  describe('streams and balances', () => {
    describe('global nav', () => {
      it('opens up to streams tab', async () => {
        await page.goto('http://127.0.0.1:3000/app');

        await expect(page).toHaveURL('http://127.0.0.1:3000/app/streams');
      });

      it('switches to the streams tab', async () => {
        await page.locator('div[data-testid="sidenav"] a:text("Streams")').click();
      });
    });

    describe('streams page empty state', () => {
      it('shows streams page empty states', async () => {
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
          '0xefbF81372aBC3723463746a89CEb42080563684C',
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
        await expect(page.locator('text=Approve')).toHaveCount(1);
      });

      it('shows the topped-up amount on the streams page', async () => {
        await page.locator('text=Got it').click({ timeout: 10000 });
      }, 10000);
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
        await page.fill(
          'label:has-text("Stream to*")',
          '0xAa90c43123ACEc193A35D33db5D71011B019779D',
        );
        await page.fill('label:has-text("Stream rate*")', '1');

        await page.locator('.modal button:has-text("Create stream")').click();
      });

      it('creates the stream', async () => {
        await expect(page.locator('text=No streams')).toHaveCount(0);
        await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      });

      it('switches to another user', async () => {
        await changeAddress(page, '0xAa90c43123ACEc193A35D33db5D71011B019779D');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
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
        await page.goto('http://127.0.0.1:3000/app/0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc');

        await expect(page.locator('text=↑ Outgoing')).toHaveCount(1);
        await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      });

      it('displays the outgoing balance', async () => {
        await expect(page.locator('text=Testcoin')).toHaveCount(1);
      });

      it('switches to another user', async () => {
        await changeAddress(page, '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc');
        await page.goto('http://127.0.0.1:3000/app/streams');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('displays the recipient users incoming stream on their profile', async () => {
        await page.goto('http://127.0.0.1:3000/app/0xAa90c43123ACEc193A35D33db5D71011B019779D');

        await expect(page.locator('text=↓ Incoming')).toHaveCount(1);
        await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      });

      it('displays the incoming balance', async () => {
        await expect(page.locator('text=Testcoin')).toHaveCount(1);
      });
    });

    describe('search', () => {
      it('opens the searchbar', async () => {
        const searchbar = page.locator('data-testid=search-button');

        await searchbar.click();
      });

      it('finds streams', async () => {
        await page.keyboard.type('E2E');
        await expect(
          page.locator('.account-menu-item-wrapper', { hasText: 'E2E Test Stream' }),
        ).toHaveCount(1);

        await page.keyboard.press('Escape');
      });

      it('finds tokens', async () => {
        await page.locator('data-testid=search-button').click();
        await page.keyboard.type('Test');

        await expect(
          page.locator('.account-menu-item-wrapper', { hasText: 'Testcoin' }),
        ).toHaveCount(1);

        await page.keyboard.press('Escape');
      });

      it('jumps to profiles', async () => {
        await page.locator('data-testid=search-button').click();
        await page.keyboard.type('0x');

        await page
          .locator('.account-menu-item-wrapper', {
            hasText: '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc',
          })
          .click();

        await page.waitForTimeout(1000);

        expect(page.url().toLowerCase()).toBe(
          'http://127.0.0.1:3000/app/0x433220a86126efe2b8c98a723e73ebad2d0cbadc',
        );
      });
    });

    describe('stream detail view', () => {
      it('opens the stream detail view', async () => {
        await page.goto('http://127.0.0.1:3000/app/streams');
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
        expectedRemainingTokenAmount = (50 - Number(streamPausedAtTotalStreamed)).toFixed(8);
      }, 20000);

      it('switches back to the user receiving the stream', async () => {
        await changeAddress(page, '0xAa90c43123ACEc193A35D33db5D71011B019779D');
        await page.goto('http://127.0.0.1:3000/app/streams');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('displays the right incoming earned amount on the streams page', async () => {
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
        await changeAddress(page, '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc');
        await page.goto('http://127.0.0.1:3000/app/streams');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('displays the right streamed amount on the streams page', async () => {
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

        expect(page.url().toLowerCase()).toBe('http://127.0.0.1:3000/app/streams');
      }, 20000);

      it('shows the streams empty state', async () => {
        const streamsEmptyState = page.locator('text=No streams');
        await expect(streamsEmptyState).toHaveCount(1);
      });

      it('still shows the balances section', async () => {
        await expect(page.locator(`text=${expectedRemainingTokenAmount}`)).toHaveCount(1);
      });

      it('switches back to the recipient', async () => {
        await changeAddress(page, '0xAa90c43123ACEc193A35D33db5D71011B019779D');
        await page.goto('http://127.0.0.1:3000/app/streams');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('still shows the balances section for the recipient', async () => {
        await expect(page.locator(`text=${streamPausedAtTotalStreamed}`)).toHaveCount(1);
      });

      it('shows the streams empty state', async () => {
        const streamsEmptyState = page.locator('text=No streams');
        await expect(streamsEmptyState).toHaveCount(1);
      });
    });

    describe('squeezing', () => {
      it('opens the collect flow', async () => {
        await page.goto('http://127.0.0.1:3000/app/streams');

        await page.locator('text=Testcoin').click();
        await page.locator('button', { hasText: 'Collect' }).click();

        await expect(page.locator('h1', { hasText: 'Collect TEST' })).toHaveCount(1);
      });

      it('expands the squeezing section', async () => {
        await page.locator('label:has-text("Include funds from current cycle")').click();

        await page
          .locator(`data-testid=item-383620263794848526656662033323214000554911775452`)
          .click();

        await page.locator('button', { hasText: 'Collect TEST' }).click();
      });

      it('shows the success screen', async () => {
        await expect(
          page.locator(
            'text=Your TEST earnings have successfully been delivered to your wallet address.',
          ),
        ).toBeVisible();

        await page.locator('button', { hasText: 'Got it' }).click();
      });

      it('shows an incoming balance of zero for Testcoin after squeezing', async () => {
        await expect(page.locator('data-testid=incoming-balance')).toHaveText('0.00');
      });
    });
  });

  describe('drip lists', () => {
    it('opens up to streams tab', async () => {
      await page.goto('http://127.0.0.1:3000/app');

      await expect(page).toHaveURL('http://127.0.0.1:3000/app/streams');
    });

    it('switches to the Drip List tab', async () => {
      await page.locator('div[data-testid="sidenav"] a:text("Drip List")').click();

      await expect(
        page.locator('text=Fund your dependencies by creating your Drip List'),
      ).toHaveCount(1);
    });

    it('opens the drip list creation flow', async () => {
      await page.locator('text=Create Drip List').click();

      await expect(page.locator('text=Create your Drip List')).toHaveCount(1);
    });

    it('adds items', async () => {
      const input = page.locator('input.list-editor__input');
      await expect(input).toHaveCount(1);
      await input.click();

      await page.keyboard.type('github.com/efstajas/drips-test-repo-10');
      await page.keyboard.press('Enter');

      await expect(
        page.locator('data-testid=item-https://github.com/efstajas/drips-test-repo-10'),
      ).toHaveCount(1);

      await page.keyboard.type('0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc');
      await page.keyboard.press('Enter');

      await expect(
        page.locator('data-testid=item-0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc'),
      ).toHaveCount(1);
    });

    it('assigns equal percentages', async () => {
      await page.locator('button', { hasText: 'Split evenly' }).click();
    });

    it('renames the drip list', async () => {
      const titleField = page.locator('label:has-text("List Title*")');
      await titleField.clear();
      await titleField.fill('This is a Test Drip List');
    });

    it('advances the flow', async () => {
      await page.locator('button', { hasText: 'Continue' }).click();
    });

    it('selects the test token to stream', async () => {
      await page.locator('data-testid=item-0xefbF81372aBC3723463746a89CEb42080563684C').click();
    });

    it('enters a monthly stream rate', async () => {
      await page.locator('label:has-text("Set a monthly stream rate")').fill('3');
    });

    it('enters a top up amount', async () => {
      await page.locator('button', { hasText: '3 months' }).click();
    });

    it('advances the flow', async () => {
      await page.locator('button', { hasText: 'Continue' }).click();
    });

    it.todo('shows the success screen with correct values');

    it('creates the drip list', async () => {
      await page.locator('button', { hasText: 'Confirm in wallet' }).click();

      await expect(page.locator('text=Congratulations!')).toHaveCount(1);
    });

    it('navigates to the Drip List screen', async () => {
      await page.locator('button', { hasText: 'View your Drip List' }).click();
      await expect(page.locator('text=This is a Test Drip List')).toHaveCount(1);
    });

    it('opens the drip list editor', async () => {
      await page.locator('button', { hasText: 'Edit list' }).click();
    });

    it('deselects an item', async () => {
      await page.locator('#trashbtn-0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc').click();

      await expect(page.locator('text=50% allocated')).toHaveCount(1);
    });

    it('adds a new item', async () => {
      await page.locator('input.list-editor__input').click();

      await page.keyboard.type('github.com/efstajas/drips-test-repo-11');
      await page.keyboard.press('Enter');
    });

    it('assigns equal percentages', async () => {
      await page.locator('button', { hasText: 'Split evenly' }).click();
    });

    it('advances the flow', async () => {
      await page.locator('button', { hasText: 'Confirm changes in wallet' }).click();
      await page.locator('button', { hasText: 'Got it' }).click();
    });

    it('displays the changes', async () => {
      await page.waitForTimeout(1000);

      await page.reload();

      await expect(page.locator('text=This is a Test Drip List')).toHaveCount(1);
      await expect(page.locator('text=0x43')).toHaveCount(0);
    });

    /* 
      The tests below are a bit tricky to implement because i wasn't able to find a way to get
      the vite preview server to pay attention to the PUBLIC_TEST_MODE env var. Without this being true,
      it won't load the single drip list view, because that fetches data server-side, and without that env
      var being set in the server just returns a 404.

      TODO: Figure out how to set PUBLIC_TEST_MODE to true in the vite `preview` server, then implement the
      below tests.
     */

    it.todo('opens the single drip list view');
    it.todo('copies the URL');
    it.todo(
      'switches to another user and allows creating a new drip list with the first drip list on it',
    );
    it.todo('navigates to the drip list support stream view');
    it.todo('allows editing the support stream rate');
    it.todo('allows deleting the support stream');
    it.todo('allows creating another support stream with a different token');
  });
}, 3600000);
