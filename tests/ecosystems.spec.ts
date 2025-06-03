import { test, expect } from '@playwright/test';
import createEcosystemPayload from './create-ecosystem-payload.json' with { type: 'json' };

test('ecosystems donation flow', async ({ page, request }) => {
  test.setTimeout(240_000);

  // create the ecosystem
  const ecosystemCreatedResponse = await request.post('http://localhost:5173/api/ecosystems', {
    data: createEcosystemPayload,
  });
  expect(ecosystemCreatedResponse.ok()).toBeTruthy();

  // wait for ecosystem to be in the correct state for deployment
  await page.waitForTimeout(5_000);

  // deploy the ecosystem
  const { id } = await ecosystemCreatedResponse.json();
  const ecosystemDeployedResponse = await request.post(
    `http://localhost:5173/api/ecosystems/${id}/deploy`,
  );
  expect(ecosystemDeployedResponse.ok()).toBeTruthy();

  page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('http://localhost:5173/app');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByTestId('sidenav-item-Ecosystems').click();
  await expect(page.getByRole('heading', { name: 'Ecosystems' })).toBeVisible();
});
