import { type Page, expect } from '@playwright/test';
import type { ConnectedSession } from './ConnectedSession';
import { OrcidClaimManager } from './OrcidClaimManager';
import { gqlClient } from './gqlClient';
import { execa } from 'execa';

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

    // Navigate to the ORCID profile page and start claiming flow
    await this.page.goto(orcidProfileUrl);
    await this.page.getByRole('button', { name: 'Claim ORCID iD' }).click();

    // Step 1: Choose Network (first step in the flow)
    await this.page.getByRole('button', { name: 'Continue' }).first().click();

    // Step 2: Enter ORCID iD (should be pre-filled since we came from the profile page)
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: Connect Wallet (might be skipped if already connected)
    await this.page.getByRole('button', { name: 'Connect wallet' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Step 4: Add Ethereum Address (verify ownership)
    await this.page.getByText('I added or edited the URL.').click();
    await this.page.getByRole('button', { name: 'Verify now' }).click();

    // Step 5: Review step
    await this.page.waitForTimeout(2000);

    // Step 8: Wallet confirmation
    await this.page.getByRole('button', { name: 'Confirm in wallet' }).click();

    await expect(this.page.getByTestId('current-tx')).toContainText('Finalizing', {
      timeout: 60_000,
    });

    const accountId = await this._populateAccountId(orcidId);

    // Update the repo owner via CLI to simulate the backend process
    await execa`npm run dev:docker:update-repo-owner -- --accountId ${accountId} --ownerAddress ${this.ownerAddress}`;

    // Step 9: Success step - wait for completion
    await expect(this.page.getByText('Success')).toBeVisible({
      timeout: 60_000,
    });

    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('button', { name: 'View ORCID profile' }).click();

    // Verify we're back on the ORCID profile page and it's now claimed
    await this.page.waitForURL(orcidProfileUrl);
    await expect(this.page.getByRole('heading', { name: 'drips.network' })).toBeVisible();
    await expect(
      this.page.locator(`.orcid-profile :text("${this.ownerAddress.slice(-4)}")`).nth(0),
    ).toBeVisible();
  }
}
