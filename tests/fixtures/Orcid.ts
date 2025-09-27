import { type Page, expect } from '@playwright/test';
import type { ConnectedSession } from './ConnectedSession';
import { type OrcidClaimManager } from './OrcidClaimManager';
import { gqlClient } from './gqlClient';

export class Orcid {
  public readonly page: Page;
  public readonly ownerAddress: string;
  public orcidId: string | null = null; // Will be set after coordination
  public accountId: string | null = null;

  constructor(
    public readonly connectedSession: ConnectedSession,
    private readonly claimManager: OrcidClaimManager,
  ) {
    this.page = connectedSession.page;
    const connectedAddress = connectedSession.address;

    if (!connectedAddress) {
      throw new Error('Connected session must have an address');
    }

    this.ownerAddress = connectedAddress;
  }

  /**
   * The main entry point for tests. It coordinates with the manager
   * to either claim the ORCID or wait for it to be claimed.
   */
  async claim() {
    this.orcidId = await this.claimManager.getClaimedOrcid(
      this.ownerAddress,
      // Pass the actual claim logic as a callback function.
      (orcidIdToClaim: string) => this._claim(orcidIdToClaim),
    );

    if (!this.accountId && this.orcidId) await this._populateAccountId(this.orcidId);
  }

  private async _populateAccountId(orcidId: string): Promise<string> {
    const accountIdResult = await gqlClient.request(`
      query GetOrcidAccountId {
        orcidLinkedIdentityByOrcid(orcid: "${orcidId}", chain: LOCALTESTNET) {
          account {
            accountId
          }
        }
      }`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.accountId = (accountIdResult as any).orcidLinkedIdentityByOrcid?.account?.accountId;

    if (!this.accountId) {
      throw new Error(`Account ID not found for ORCID ${orcidId}`);
    }

    return this.accountId;
  }

  /**
   * This private method contains the original claim logic.
   * It's now invoked by the manager to avoid race conditions.
   */
  private async _claim(orcidId: string) {
    const orcidProfileUrl = `http://localhost:5173/app/orcids/${orcidId}`;

    // Navigate to the ORCID profile page
    await this.page.goto(orcidProfileUrl);

    // Wait for the page to load and verify we're on the correct ORCID profile
    await expect(this.page.getByText('Shawna Test Sadler Test')).toBeVisible();

    // Check if there are claimable funds
    await expect(this.page.getByText('$0.00')).toBeVisible();

    // Verify the claimable funds section is visible
    await expect(this.page.getByText('Claimable funds')).toBeVisible();

    // Click the "Claim ORCID iD" button to start the claiming flow
    await this.page.getByRole('button', { name: 'Claim ORCID iD' }).click();

    // Step 1: Choose Network (first step in the flow)
    await this.page.waitForTimeout(2000);

    // Look for Continue button to proceed from network selection
    let continueButton = this.page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isVisible({ timeout: 10000 })) {
      await continueButton.click();
    }

    // Step 2: Enter ORCID iD (should be pre-filled since we came from the profile page)
    await this.page.waitForTimeout(2000);

    // The ORCID iD should be pre-filled, look for Search button or Continue button
    const searchButton = this.page.getByRole('button', { name: 'Search' });
    if (await searchButton.isVisible({ timeout: 5000 })) {
      await searchButton.click();
      // Wait for search to complete and Continue button to appear
      await this.page.waitForTimeout(3000);
    }

    continueButton = this.page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isVisible({ timeout: 10000 })) {
      await continueButton.click();
    }

    // Step 3: Connect Wallet (might be skipped if already connected)
    await this.page.waitForTimeout(2000);

    continueButton = this.page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isVisible({ timeout: 10000 })) {
      await continueButton.click();
    }

    // Step 4: Add Ethereum Address (verify ownership)
    await this.page.waitForTimeout(2000);

    // Look for the verification step - need to check the checkbox first
    const checkbox = this.page.getByRole('checkbox');
    if (await checkbox.isVisible({ timeout: 10000 })) {
      await checkbox.check();
    }

    // Then click Verify now
    const verifyButton = this.page.getByRole('button', { name: 'Verify now' });
    if (await verifyButton.isVisible({ timeout: 10000 })) {
      await verifyButton.click();
      // Wait for verification to complete
      await this.page.waitForTimeout(5000);
    }

    // Step 5: Review step
    await this.page.waitForTimeout(2000);

    continueButton = this.page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isVisible({ timeout: 10000 })) {
      await continueButton.click();
    }

    // Step 6: Set Splits and Emit Metadata
    await this.page.waitForTimeout(2000);

    // Look for splits configuration - might have percentage input fields
    const splitInput = this.page.getByRole('textbox').first();
    if (await splitInput.isVisible({ timeout: 10000 })) {
      await splitInput.fill('100');
      await splitInput.press('Enter');
    }

    // Continue to next step after setting splits
    continueButton = this.page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isVisible({ timeout: 10000 })) {
      await continueButton.click();
    }

    // Look for final continue button before wallet confirmation
    await this.page.waitForTimeout(2000);
    continueButton = this.page.getByRole('button', { name: 'Continue' });
    if (await continueButton.isVisible({ timeout: 10000 })) {
      await continueButton.click();
    }

    // Step 7: Wallet confirmation
    const confirmButton = this.page.getByRole('button', { name: 'Confirm in wallet' });
    if (await confirmButton.isVisible({ timeout: 10000 })) {
      await confirmButton.click();

      // Wait for transaction to be processed
      await expect(this.page.getByTestId('current-tx')).toContainText('Finalizing', {
        timeout: 60_000,
      });
    }

    // Step 8: Success step - wait for completion
    await expect(this.page.getByText('Success')).toBeVisible({
      timeout: 60_000,
    });

    // Look for "View your ORCID" or similar completion link
    const viewOrcidLink = this.page.getByRole('link', { name: 'View your ORCID' });
    if (await viewOrcidLink.isVisible({ timeout: 10000 })) {
      await viewOrcidLink.click();
    } else {
      // Alternative: look for a final continue or done button
      const finalButton = this.page.getByRole('button', { name: 'Done' });
      if (await finalButton.isVisible({ timeout: 10000 })) {
        await finalButton.click();
      }
    }

    // Verify we're back on the ORCID profile page and it's now claimed
    await this.page.waitForURL(orcidProfileUrl);
    await expect(this.page.getByText('Shawna Test Sadler Test')).toBeVisible();

    // Verify that the ORCID is now claimed (should show splits section)
    await expect(this.page.getByText('Splits', { exact: true })).toBeVisible();
  }
}
