import { type Page, expect } from '@playwright/test';
import { execa } from 'execa';
import type { ConnectedSession } from './ConnectedSession';
import { type ProjectClaimManager } from './ProjectClaimManager';
import { gqlClient } from './gqlClient';

export class Project {
  public readonly page: Page;
  public readonly ownerAddress: string;
  public repoUrl: string | null = null; // Will be set after coordination
  public accountId: string | null = null;

  constructor(
    public readonly connectedSession: ConnectedSession,
    private readonly claimManager: ProjectClaimManager,
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
   * to either claim the project or wait for it to be claimed.
   */
  async claim() {
    this.repoUrl = await this.claimManager.getClaimedProject(
      this.ownerAddress,
      // Pass the actual claim logic as a callback function.
      (repoUrlToClaim) => this._claim(repoUrlToClaim),
    );

    if (!this.accountId) await this._populateAccountId(this.repoUrl);
  }

  private async _populateAccountId(repoUrl: string): Promise<string> {
    const accountIdResult = await gqlClient.request(`
      query GetAccountId {
        projectByUrl(url: "${repoUrl}", chains: [LOCALTESTNET]) {
          account {
            accountId
          }
        }
      }`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.accountId = (accountIdResult as any).projectByUrl.account.accountId;

    if (!this.accountId) {
      throw new Error(`Account ID not found for project ${repoUrl}`);
    }

    return this.accountId;
  }

  /**
   * This private method contains the original claim logic.
   * It's now invoked by the manager to avoid race conditions.
   */
  private async _claim(repoUrl: string) {
    // Navigate and perform all the UI actions to claim the project
    await this.page.getByRole('link', { name: 'Projects' }).click();
    await this.page.getByRole('button', { name: 'Claim project' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('textbox', { name: 'Paste your GitHub project URL' }).fill(repoUrl);
    await this.page.getByRole('textbox', { name: 'Paste your GitHub project URL' }).press('Enter');
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByText('I edited the FUNDING.json file').click();
    await this.page.getByRole('button', { name: 'Verify now' }).click();
    await this.page.getByRole('textbox').first().fill('100');
    await this.page.getByRole('textbox').first().press('Enter');
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('button', { name: 'Confirm in wallet' }).click();

    await expect(this.page.getByTestId('current-tx')).toContainText('Finalizing verification', {
      timeout: 60_000,
    });

    const accountId = await this._populateAccountId(repoUrl);

    // The critical execa call is now protected by the singleton's logic.
    await execa`npm run dev:docker:update-repo-owner -- --accountId ${accountId} --ownerAddress ${this.ownerAddress}`;

    await expect(this.page.getByText('Set project splits and metadata')).toBeVisible({
      timeout: 60_000,
    });

    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('link', { name: 'View your project' }).click();

    const repoName = repoUrl.split('/').slice(-2).join('/');
    await this.page.waitForURL(`http://localhost:5173/app/projects/github/${repoName}?exact`);
    await expect(this.page.getByText(repoName).nth(0)).toBeVisible();
    await expect(this.page.getByText('Splits', { exact: true })).toBeVisible();
  }
}
