import { test } from '@playwright/test';

test('round creation', async ({ page }) => {
  await page.goto('http://localhost:5173/app');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();

  await page.getByRole('link', { name: 'RetroPGF' }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'New round' }).click();
  await page.getByRole('button', { name: 'Share' }).click();
  await page.getByRole('button', { name: 'Copy link' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('button', { name: 'Delete draft' }).click();
  await page.getByRole('button', { name: 'Yes, continue' }).click();
  await page.getByRole('button', { name: 'New round' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('textbox', { name: 'Round name*' }).click();
  await page.getByRole('textbox', { name: 'Round name*' }).fill('E2E Test Round');
  await page.getByRole('button', { name: '🐶' }).click();
  await page.getByRole('img', { name: '🐘' }).click();
  await page.locator('div:nth-child(13) > .color-label').click();
  await page.getByRole('textbox', { name: 'localtestnet.drips.network/' }).click();
  await page.getByRole('textbox', { name: 'localtestnet.drips.network/' }).fill('e2e');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('This is a *description*!\n\n# Headline\n\nparagraph');
  await page.getByRole('button', { name: 'Save changes' }).click();
});
