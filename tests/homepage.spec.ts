import { test, expect } from '@playwright/test';

test('shows open app button on homepage', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  await expect(page.getByRole('link', { name: 'Open app' })).toBeVisible();
});
