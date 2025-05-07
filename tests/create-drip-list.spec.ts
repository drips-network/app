import { test, expect } from '@playwright/test';

test('create a drip list', async ({ page }) => {
  test.setTimeout(240_000);

  page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('http://localhost:5173/app');
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
  await page.getByText('0', { exact: true }).click();
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .fill('40');
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .press('Enter');
  await page.getByRole('button', { name: 'Continue' }).nth(0).click();
  await page.getByRole('button', { name: 'Support later' }).click();
  await page.getByRole('button', { name: 'Confirm in wallet' }).click();
  await page.getByRole('button', { name: 'Continue' }).nth(0).click({ timeout: 120_000 });
  await page.getByRole('button', { name: 'View your Drip List' }).click();

  await page.waitForURL('http://localhost:5173/app/drip-lists/*');

  await expect(page.getByText('drips-test-repo-10').nth(0)).toBeVisible();
  await expect(page.getByText('E2E test list').nth(0)).toBeVisible();
  await expect(page.getByText('This is the description right here!').nth(0)).toBeVisible();
  await expect(page.getByText('60%').nth(0)).toBeVisible();
  await expect(page.getByText('40%').nth(0)).toBeVisible();
});

test.skip('create collaborative drip list', async ({ page }) => {
  test.setTimeout(240_000);

  page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('http://localhost:5173/app');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('link', { name: 'Drip Lists' }).click();
  await page.getByRole('button', { name: 'Create Drip List' }).click();
  await page.getByRole('textbox', { name: 'Title*' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Title*' }).fill('Test collaborative list');
  await page.getByRole('textbox', { name: 'Title*' }).press('Tab');
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('This is a test for a collaborative drip list');
  await page
    .getByRole('radio', {
      name: 'Collaborate on recipients Invite collaborators to decide together Set a voting period Publish your list after voting',
      exact: true,
    })
    .click();
  await page.getByRole('button', { name: 'Continue' }).nth(0).click();
  await page.getByRole('textbox', { name: 'Add Collaborators* Import' }).click();
  await page.getByRole('textbox', { name: 'Add Collaborators* Import' }).click();
  await page
    .getByRole('textbox', { name: 'Add Collaborators* Import' })
    .fill('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  await page.getByRole('textbox', { name: 'Add Collaborators* Import' }).press('Enter');

  const currentTime = new Date();
  const in15Seconds = new Date(currentTime.getTime() + 15 * 1000);
  const inCurrentTimezone = new Date(
    in15Seconds.getTime() - in15Seconds.getTimezoneOffset() * 60000,
  );

  // fill in the date and time in `YYYY-MM-DD HH:MM:SS` format
  await page
    .getByTestId('date-time-field')
    .fill(inCurrentTimezone.toISOString().slice(0, 19).replace('T', ' '));

  await page.getByRole('button', { name: 'Continue' }).nth(0).click();
  await page.getByRole('button', { name: 'Confirm in wallet' }).click();
  await page.getByRole('button', { name: 'View your Drip List' }).click();
  await page.getByRole('button', { name: 'Cast your vote' }).click();
  await page.getByRole('textbox', { name: 'Add' }).click();
  await page.getByRole('textbox', { name: 'Add' }).fill('github.com/efstajas/drips-test-repo-10');
  await page.getByRole('textbox', { name: 'Add' }).press('Enter');
  await page
    .getByRole('textbox', { name: 'Add' })
    .fill('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  await page.getByRole('textbox', { name: 'Add' }).press('Enter');
  await page.getByRole('button', { name: 'Clear' }).click();
  await page
    .getByTestId('item-642829559307850963015472508762062935916233390536')
    .getByText('0', { exact: true })
    .click();
  await page
    .getByTestId('item-642829559307850963015472508762062935916233390536')
    .getByRole('spinbutton')
    .fill('30');
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByText('0', { exact: true })
    .click();
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .fill('70');
  await page
    .getByTestId('item-80921553623925136102837120782793736893291544351678576578072673071408')
    .getByRole('spinbutton')
    .press('Enter');
  await page.getByRole('button', { name: 'Confirm in wallet' }).click();
  await page.getByRole('button', { name: 'Got it' }).click();
  await page.getByRole('button', { name: 'Share with collaborators' }).click();
  await page.getByRole('button', { name: 'Copy link' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();

  await page.getByRole('button', { name: 'Publish Drip List' }).nth(1).click({ timeout: 120_000 });
  await page.getByRole('button', { name: 'Confirm in wallet' }).click();
  await page.getByRole('button', { name: 'Continue' }).nth(0).click({ timeout: 120_000 });
  await page.getByRole('button', { name: 'Got it' }).click();

  await expect(page.getByText('this list is in voting').nth(0)).not.toBeVisible();
  await expect(page.getByText('Test collaborative list').nth(0)).toBeVisible();
  await expect(page.getByText('This is a test for a collaborative drip list').nth(0)).toBeVisible();
});
