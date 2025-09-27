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

test('claim ORCID flow', async ({ connectedSession }) => {
  test.setTimeout(120_000);

  const orcidId = '0009-0007-1106-8413';
  const orcidProfileUrl = `http://localhost:5173/app/orcids/${orcidId}`;

  // Navigate to the ORCID profile page
  await connectedSession.page.goto(orcidProfileUrl);

  // Wait for the page to load and verify we're on the correct ORCID profile
  await expect(connectedSession.page.getByText('Shawna Test Sadler Test')).toBeVisible();

  // Check if there are claimable funds (should show $0.00 based on screenshot)
  await expect(connectedSession.page.getByText('$0.00')).toBeVisible();

  // Verify the claimable funds section is visible
  await expect(connectedSession.page.getByText('Claimable funds')).toBeVisible();

  // Click the "Claim ORCID iD" button to start the claiming flow
  await connectedSession.page.getByRole('button', { name: 'Claim ORCID iD' }).click();

  // Step 1: Choose Network (first step in the flow)
  await connectedSession.page.waitForTimeout(2000);

  // Look for Continue button to proceed from network selection
  let continueButton = connectedSession.page.getByRole('button', { name: 'Continue' });
  if (await continueButton.isVisible({ timeout: 10000 })) {
    await continueButton.click();
  }

  // Step 2: Enter ORCID iD (should be pre-filled since we came from the profile page)
  await connectedSession.page.waitForTimeout(2000);

  // The ORCID iD should be pre-filled, look for Search button or Continue button
  const searchButton = connectedSession.page.getByRole('button', { name: 'Search' });
  if (await searchButton.isVisible({ timeout: 5000 })) {
    await searchButton.click();
    // Wait for search to complete and Continue button to appear
    await connectedSession.page.waitForTimeout(3000);
  }

  continueButton = connectedSession.page.getByRole('button', { name: 'Continue' });
  if (await continueButton.isVisible({ timeout: 10000 })) {
    await continueButton.click();
  }

  // Step 3: Connect Wallet (might be skipped if already connected)
  await connectedSession.page.waitForTimeout(2000);

  continueButton = connectedSession.page.getByRole('button', { name: 'Continue' });
  if (await continueButton.isVisible({ timeout: 10000 })) {
    await continueButton.click();
  }

  // Step 4: Add Ethereum Address (verify ownership)
  await connectedSession.page.waitForTimeout(2000);

  // Look for the verification step - need to check the checkbox first
  const checkbox = connectedSession.page.getByRole('checkbox');
  if (await checkbox.isVisible({ timeout: 10000 })) {
    await checkbox.check();
  }

  // Then click Verify now
  const verifyButton = connectedSession.page.getByRole('button', { name: 'Verify now' });
  if (await verifyButton.isVisible({ timeout: 10000 })) {
    await verifyButton.click();
    // Wait for verification to complete
    await connectedSession.page.waitForTimeout(5000);
  }

  // Step 5: Review step
  await connectedSession.page.waitForTimeout(2000);

  continueButton = connectedSession.page.getByRole('button', { name: 'Continue' });
  if (await continueButton.isVisible({ timeout: 10000 })) {
    await continueButton.click();
  }

  // Step 6: Set Splits and Emit Metadata
  await connectedSession.page.waitForTimeout(2000);

  // Look for splits configuration - might have percentage input fields
  const splitInput = connectedSession.page.getByRole('textbox').first();
  if (await splitInput.isVisible({ timeout: 10000 })) {
    await splitInput.fill('100');
    await splitInput.press('Enter');
  }

  // Continue to next step after setting splits
  continueButton = connectedSession.page.getByRole('button', { name: 'Continue' });
  if (await continueButton.isVisible({ timeout: 10000 })) {
    await continueButton.click();
  }

  // Look for final continue button before wallet confirmation
  await connectedSession.page.waitForTimeout(2000);
  continueButton = connectedSession.page.getByRole('button', { name: 'Continue' });
  if (await continueButton.isVisible({ timeout: 10000 })) {
    await continueButton.click();
  }

  // Step 7: Wallet confirmation
  const confirmButton = connectedSession.page.getByRole('button', { name: 'Confirm in wallet' });
  if (await confirmButton.isVisible({ timeout: 10000 })) {
    await confirmButton.click();

    // Wait for transaction to be processed
    await expect(connectedSession.page.getByTestId('current-tx')).toContainText('Finalizing', {
      timeout: 60_000,
    });
  }

  // Step 8: Success step - wait for completion
  await expect(connectedSession.page.getByText('Success')).toBeVisible({
    timeout: 60_000,
  });

  // Look for "View your ORCID" or similar completion link
  const viewOrcidLink = connectedSession.page.getByRole('link', { name: 'View your ORCID' });
  if (await viewOrcidLink.isVisible({ timeout: 10000 })) {
    await viewOrcidLink.click();
  } else {
    // Alternative: look for a final continue or done button
    const finalButton = connectedSession.page.getByRole('button', { name: 'Done' });
    if (await finalButton.isVisible({ timeout: 10000 })) {
      await finalButton.click();
    }
  }

  // Verify we're back on the ORCID profile page and it's now claimed
  await connectedSession.page.waitForURL(orcidProfileUrl);
  await expect(connectedSession.page.getByText('Shawna Test Sadler Test')).toBeVisible();

  // Verify that the ORCID is now claimed (should show splits section)
  await expect(connectedSession.page.getByText('Splits', { exact: true })).toBeVisible();
});
