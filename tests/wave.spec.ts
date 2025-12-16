import { test, expect } from '@playwright/test';

test('loads the /wave page', async ({ page }) => {
  await page.goto('http://localhost:5173/wave');

  await expect(page.getByRole('heading', { name: 'Introducing Drips Wave' })).toBeVisible();
});
