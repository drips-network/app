import { test, expect } from '@playwright/test';
import createEcosystemPayload from './create-ecosystem-payload.json' with { type: 'json' };

test('ecosystems donation flow', async ({ page, request }) => {
  test.setTimeout(480_000);

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

  // navigate to ecosystems and check that the created ecosystem is displayed
  await page.goto('http://localhost:5173/app');
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await page.getByTestId('sidenav-item-Ecosystems').click();
  await expect(page.getByRole('heading', { name: 'Ecosystems' })).toBeVisible();

  // wait for the api to return an ecosystem that we can support
  // by checking for the appearance of funds donated
  const fundsDisplaySelector = '.ecosystem-card .aggregate-fiat-estimate';
  let fundsDisplay = await page.$(fundsDisplaySelector);
  while (!fundsDisplay) {
    await page.reload();
    await page.getByRole('button', { name: 'Connect', exact: true }).click();
    await page.getByTestId('sidenav-item-Ecosystems').click();
    // NOTE: strategically placed timeout!
    await page.waitForTimeout(1_000);
    fundsDisplay = await page.$(fundsDisplaySelector);
  }

  // navigate to the created ecosystem
  await page.locator(`text=${createEcosystemPayload.name}`).nth(0).click();

  // perform a one-time donation
  await page.getByRole('button', { name: 'Support' }).nth(0).click();
  await page.getByRole('button', { name: 'One-time donation' }).first().click();
  await page.getByText('Test Token').click();
  await page.getByRole('spinbutton', { name: 'TEST Amount Max' }).click();
  await page.getByRole('spinbutton', { name: 'TEST Amount Max' }).fill('10');
  await page.getByRole('button', { name: 'Confirm in your wallet' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Got it' }).click();

  // verify that support shows the donation
  await expect(await page.getByText('10 TEST').nth(0)).toBeVisible();

  // verify that the ecosystem support has propagated to the relevant projects.
  const page1Promise = page.waitForEvent('popup');
  // skip root node
  await page.getByRole('link', { name: createEcosystemPayload.graph.nodes[1].projectName }).click();
  const page1 = await page1Promise;
  await expect(await page1.locator(`text=${createEcosystemPayload.name}`).nth(0)).toBeVisible();
});
