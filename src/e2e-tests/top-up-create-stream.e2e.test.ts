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
import dotenv from 'dotenv';

dotenv.config();

describe('app', async () => {
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

  beforeAll(async () => {
    await environment.wait();

    console.log('🌳 Environment is up. Running tests...');
  }, 14400000);

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  describe('streams and balances', () => {
    describe('global nav', () => {
      it('opens up to explore tab', async () => {
        await page.goto('http://127.0.0.1:3001/app');

        await expect(page.locator('text=Stats')).toHaveCount(1);
      });

      it('switches to the funds tab', async () => {
        await page.locator('div[data-testid="sidenav"] a:text("Funds")').click();
      });
    });

    describe('funds page empty state', () => {
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
          '0x27aa1eEDF2F775e949f1D01d886400E5a019fe7B',
        );

        await page.locator('button', { hasText: 'Add custom token' }).click();
        await page.locator('button', { hasText: 'Got it' }).click();
      });

      it('displays the custom mock erc-20 token', async () => {
        // Test token item in the list-select component
        const testcoin = page.locator(
          'data-testid=item-0x27aa1eEDF2F775e949f1D01d886400E5a019fe7B',
        ); //
        await testcoin.click();

        const topUpButton = page.locator('text=Add Test token');
        await topUpButton.click();
      });

      it('displays the amount step', async () => {
        await page.fill('label:has-text("Amount")', '50');
        await page.locator('data-testid=confirm-amount-button').click();
      });

      it('displays the approve step', async () => {
        await expect(page.locator('text=Approve')).toHaveCount(1);
      });

      it('shows the topped-up amount on the funds page', async () => {
        await page.locator('text=Got it').click({ timeout: 30000 });
        await page.waitForTimeout(2000);
        await page.reload();
      }, 50000);
    });

    describe('create stream flow', () => {
      it('opens the create stream modal', async () => {
        await page.locator('text=Create stream').click();

        await expect(
          page.locator('text=Stream any ERC-20 token from your Drips account.'),
        ).toHaveCount(1);
      });

      it('allows selecting the available outbound TEST balance', async () => {
        await page.locator('.label:has-text("Test token")').click();
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

      it('switches to recipient', async () => {
        await changeAddress(page, '0xAa90c43123ACEc193A35D33db5D71011B019779D');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('displays the incoming stream', async () => {
        await expect(page.locator('text=From')).toHaveCount(1);
        await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      });

      it('displays the incoming balance', async () => {
        await expect(page.locator('text=Test token')).toHaveCount(1);
      });
    });

    describe('profile view', () => {
      it('displays the senders outgoing stream on their profile', async () => {
        await page.goto('http://127.0.0.1:3001/app/0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc');

        await expect(page.locator('text=Total streamed')).toHaveCount(1);
        await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      });

      it('displays the outgoing balance', async () => {
        await expect(page.locator('text=Test token')).toHaveCount(1);
      });

      it('switches to recipient funds dashboard', async () => {
        await changeAddress(page, '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc');
        await page.goto('http://127.0.0.1:3001/app/funds');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('displays the recipients incoming stream on their profile', async () => {
        await page.goto('http://127.0.0.1:3001/app/0xAa90c43123ACEc193A35D33db5D71011B019779D');

        await expect(page.locator('text=From')).toHaveCount(1);
        await expect(page.locator('text=E2E Test Stream')).toHaveCount(1);
      });

      it('displays the incoming balance', async () => {
        await expect(page.locator('text=Test token')).toHaveCount(1);
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
          page.locator('.account-menu-item-wrapper', { hasText: 'Test token' }),
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
          'http://127.0.0.1:3001/app/0x433220a86126efe2b8c98a723e73ebad2d0cbadc',
        );
      });
    });

    describe('stream detail view', () => {
      it('opens the funds detail view', async () => {
        await page.goto('http://127.0.0.1:3001/app/funds');
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
        await page.goto('http://127.0.0.1:3001/app/funds');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('displays the right incoming earned amount on the funds page', async () => {
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
        await page.goto('http://127.0.0.1:3001/app/funds');

        await page.reload();

        await expect(page.locator('text=Balances')).toHaveCount(1);
      });

      it('displays the right streamed amount on the funds page', async () => {
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

        expect(page.url().toLowerCase()).toBe('http://127.0.0.1:3001/app/funds');
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
        await page.goto('http://127.0.0.1:3001/app/funds');

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
        await page.goto('http://127.0.0.1:3001/app/funds');

        await page.locator('text=Test token').click();
        await page.locator('data-testid=token-page-collect-button').click();

        await expect(page.locator('h1', { hasText: 'Collect TEST' })).toHaveCount(1);
      });

      it('expands the squeezing section', async () => {
        await page.locator('label:has-text("Include unsettled stream funds")').click();

        await expect(
          page.locator(`data-testid=item-383620263794848526656662033323214000554911775452`),
        ).toHaveAttribute('aria-selected', 'true');

        await page.locator('button', { hasText: 'Collect TEST' }).click();
      });

      it('shows the success screen', async () => {
        await expect(
          page.locator(
            'text=Your TEST funds have successfully been delivered to your wallet address.',
          ),
        ).toBeVisible();

        await page.locator('button', { hasText: 'Got it' }).click();
      });

      it('shows an incoming balance of zero for Test token after squeezing', async () => {
        await expect(page.locator('data-testid=incoming-balance')).toHaveText('0.00');
      });
    });
  });

  describe('drip lists', () => {
    describe('create drip list flow', () => {
      it('opens up to explore tab', async () => {
        await page.goto('http://127.0.0.1:3001/app');

        await expect(page.locator('text=Stats')).toHaveCount(1);
      });

      it('switches to the Drip List tab', async () => {
        await page.locator('div[data-testid="sidenav"] a:text("Drip Lists")').click();

        await expect(
          page.locator('text=Support all your dependencies at once with a Drip List'),
        ).toHaveCount(1);
      });

      it('opens the create drip list flow', async () => {
        await page.locator('text=Create Drip List').click();

        await expect(page.locator('h1:has-text("Create a Drip List")')).toHaveCount(1);
      });

      it('renames the drip list', async () => {
        const titleField = page.locator('label:has-text("Title*")');
        await titleField.clear();
        await titleField.fill('This is a Test Drip List');
      });

      it('gives a description', async () => {
        await page.locator('label:has-text("Description")').fill('This is my list description.');
      });

      it('selects choose yourself option', async () => {
        await page.locator('text=Choose by yourself').click();
        await page.locator('text=Continue').click();

        await expect(page.locator('h1:has-text("Create a Drip List")')).toHaveCount(1);
      });

      it('adds items', async () => {
        console.log(1);

        const input = page.locator(
          'input[placeholder="GitHub URL, ETH address, or Drip List URL"]',
        );
        await expect(input).toHaveCount(1);
        await input.click();

        console.log(2);

        await page.keyboard.type('github.com/efstajas/drips-test-repo-10');
        console.log(3);
        await page.keyboard.press('Enter');
        console.log(4);

        await expect(
          page.locator(
            'data-testid=item-80921553623925136102837120782793736893291544351678576578072673071408',
          ),
        ).toHaveCount(1);

        console.log(5);

        await page.keyboard.type('0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc');

        console.log(6);
        await page.keyboard.press('Enter');

        console.log(7);

        await expect(
          page.locator('data-testid=item-383620263794848526656662033323214000554911775452'),
        ).toHaveCount(1);

        console.log(8);
      });

      it('advances the flow', async () => {
        await page.locator('button', { hasText: 'Continue' }).click();
      });

      it('selects the no support option', async () => {
        await page.locator('button', { hasText: 'Support later' }).click();
      });

      it('opens the review step', async () => {
        await expect(page.locator('text=Review')).toHaveCount(1);
      });

      it('goes back to the support options', async () => {
        await page.waitForTimeout(1000); // Wait for previous step to be unmounted

        await page.locator('button', { hasText: 'Back' }).click();
        await expect(page.locator('text=Support your Drip List')).toHaveCount(1);
      });

      it('selects the continuous support option', async () => {
        await page.locator('button', { hasText: 'Continuous support' }).click();
        await page.locator('button', { hasText: 'Continue' }).click();
      });

      it('selects the test token to stream', async () => {
        await page.locator('data-testid=item-0x27aa1eEDF2F775e949f1D01d886400E5a019fe7B').click();
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

        await expect(page.locator('text=Congratulations!')).toHaveCount(1, { timeout: 20000 });
      }, 30000);
    });

    describe('edit drip list', () => {
      it('navigates to the Drip List screen', async () => {
        await page.locator('button', { hasText: 'View your Drip List' }).click();

        await page.waitForTimeout(1000);

        await expect(page.locator('text=This is a Test Drip List')).toHaveCount(2);
        await expect(page.locator('text=This is my list description.')).toHaveCount(1);
      });

      it('opens the drip list editor', async () => {
        await page.locator('button', { hasText: 'Edit list' }).click();
      });

      it('removes an item', async () => {
        await page.getByTestId('remove-383620263794848526656662033323214000554911775452').click();

        await expect(page.locator('text=50% split')).toHaveCount(1);
      });

      it('adds a new item', async () => {
        await page
          .locator('input[placeholder="GitHub URL, ETH address, or Drip List URL"]')
          .click();

        await page.keyboard.type('github.com/efstajas/drips-test-repo-11');
        await page.keyboard.press('Enter');
      });

      it('assigns equal percentages', async () => {
        await page.waitForTimeout(2000); // Wait for new item to be added

        await page.locator('button', { hasText: 'Split evenly' }).click();
      });

      it('edits the title', async () => {
        const titleField = page.locator('label:has-text("Title*")');
        await titleField.clear();
        await titleField.fill('This is an EDITED title');
      });

      it('edits the description', async () => {
        const titleField = page.locator('label:has-text("Description")');
        await titleField.clear();
        await titleField.fill('This is an EDITED description.');
      });

      it('advances the flow', async () => {
        await page.locator('button', { hasText: 'Confirm changes in your wallet' }).click();
        await page.locator('button', { hasText: 'Got it' }).click();
      });

      it('displays the changes', async () => {
        await page.waitForTimeout(6000);

        await page.reload();

        await expect(page.locator('text=This is an EDITED title')).toHaveCount(1);
        await expect(page.locator('text=This is an EDITED description.')).toHaveCount(1);
        await expect(page.locator('text=drips-test-repo-11')).toHaveCount(1);
        await expect(page.locator('text=0x43')).toHaveCount(0);
      }, 10000);
    });

    describe.todo('makes a one-time donation');

    describe.todo('create another drip list');
    describe.todo('displays drip lists on profile');
    describe.todo('nest drip lists');
  });
}, 3600000);
