import { test as base, expect } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';

const test = base.extend<{ connectedSession: ConnectedSession }>({
  connectedSession: async ({ page }, use) => {
    const connectedSession = new ConnectedSession(page, TEST_ADDRESSES[0]);
    await connectedSession.goto();
    await connectedSession.connect();

    await use(connectedSession);
  },
});

test('create a drip list', async ({ page, connectedSession }) => {
  test.setTimeout(240_000);

  await page.goto('http://localhost:5173/app/drip-lists');
  await connectedSession.connect();

  await page.getByRole('button', { name: 'Create Drip List' }).click();
  await page.getByRole('textbox', { name: 'Title*' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Title*' }).fill('E2E test list');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('This is the description right here!');
  await page.getByRole('button', { name: 'Continue' }).nth(0).click();
  await page.getByTestId('list-editor-input').click();
  await page.getByTestId('list-editor-input').fill('github.com/efstajas/drips-test-repo-10');
  await page.getByTestId('list-editor-input').press('Enter');
  await page.getByTestId('list-editor-input').click();
  await page.getByTestId('list-editor-input').fill('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  await page.getByTestId('list-editor-input').press('Enter');
  await page.getByRole('button', { name: 'Clear' }).click();
  await page
    .getByTestId('item-642829559307850963015472508762062935916233390536')
    .getByText('0', { exact: true })
    .click();
  await page
    .getByTestId('item-642829559307850963015472508762062935916233390536')
    .getByRole('spinbutton')
    .fill('60');
  await page
    .getByTestId('item-642829559307850963015472508762062935916233390536')
    .getByRole('spinbutton')
    .press('Enter');
  await page.getByText('0', { exact: true }).nth(0).click();
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .fill('40');
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .press('Enter');
  await page.getByRole('button', { name: 'Continue' }).nth(0).click();
  await page.getByRole('button', { name: 'Confirm in wallet' }).click();
  await page.getByRole('button', { name: 'Continue' }).nth(0).click({ timeout: 120_000 });
  await page.getByRole('link', { name: 'View your Drip List' }).click();

  await page.waitForURL('http://localhost:5173/app/drip-lists/*');

  await expect(page.getByText('drips-test-repo-10').nth(0)).toBeVisible();
  await expect(page.getByText('E2E test list').nth(0)).toBeVisible();
  await expect(page.getByText('This is the description right here!').nth(0)).toBeVisible();
  await expect(page.getByText('60%').nth(0)).toBeVisible();
  await expect(page.getByText('40%').nth(0)).toBeVisible();
});
