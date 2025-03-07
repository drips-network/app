import { test, expect } from '@playwright/test';

test('create a drip list', async ({ page }) => {
  test.setTimeout(240_000);

  page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Open app' }).click();
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('link', { name: 'Drip Lists' }).click();
  await page.getByRole('button', { name: 'Create Drip List' }).click();
  await page.getByRole('textbox', { name: 'Title*' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Title*' }).fill('E2E test list');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('This is the description right here!');
  await page
    .getByRole('radio', {
      name: 'Collaborate on recipients Invite collaborators to decide together Set a voting period Publish your list after voting Recipients*',
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('github.com/efstajas/drips-test-repo-10');
  await page.getByRole('textbox').press('Enter');
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').fill('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  await page.getByRole('textbox').press('Enter');
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
  await page.getByText('0', { exact: true }).click();
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .fill('40');
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .press('Enter');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Support later' }).click();
  await page.getByRole('button', { name: 'Confirm in wallet' }).click();
  await page.getByRole('button', { name: 'Continue' }).click({ timeout: 120_000 });
  await page.getByRole('button', { name: 'View your Drip List' }).click();

  await page.waitForURL('http://localhost:5173/app/drip-lists/*');

  await expect(page.getByText('drips-test-repo-10').nth(0)).toBeVisible();
  await expect(page.getByText('E2E test list').nth(0)).toBeVisible();
  await expect(page.getByText('This is the description right here!').nth(0)).toBeVisible();
  await expect(page.getByText('60%').nth(0)).toBeVisible();
  await expect(page.getByText('40%').nth(0)).toBeVisible();
});
