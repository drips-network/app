import { test, expect } from '@playwright/test';
import { execa } from 'execa';

test('claim project flow', async ({ page }) => {
  test.setTimeout(240_000);

  page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('http://localhost:5173/app');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('button', { name: 'Claim project' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Paste your GitHub project URL' }).click();
  await page
    .getByRole('textbox', { name: 'Paste your GitHub project URL' })
    .fill('github.com/efstajas/drips-test-repo-10');
  await page.getByRole('textbox', { name: 'Paste your GitHub project URL' }).press('Enter');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('I edited the FUNDING.json file').click();
  await page.getByRole('button', { name: 'Verify now' }).click();
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('100');
  await page.getByRole('textbox').first().press('Enter');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Confirm in wallet' }).click();

  await expect(page.getByTestId('current-tx')).toContainText('Finalizing verification', {
    timeout: 60_000,
  });

  await execa`npm run dev:docker:update-repo-owner -- --accountId 80921553623925136102837120782793736893291544351678576578072673071408 --ownerAddress 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`;

  await expect(page.getByText('Set project splits and metadata')).toBeVisible();

  await page.getByRole('button', { name: 'Continue' }).click({ timeout: 120_000 });
  await page.getByRole('button', { name: 'View project profile' }).click();

  await page.waitForURL(
    'http://localhost:5173/app/projects/github/efstajas/drips-test-repo-10?exact',
  );
  await expect(page.getByText('drips-test-repo-10').nth(0)).toBeVisible();
  await expect(page.getByText('Splits', { exact: true })).toBeVisible();
});
