import { type Page, expect } from '@playwright/test';
import { execa } from 'execa';
import { GraphQLClient } from 'graphql-request';
import type { ConnectedSession } from './ConnectedSession';

export class Project {
  public readonly page: Page;
  public readonly ownerAddress: string;
  public claimed: boolean = false;
  public accountId: string | null = null;

  constructor(
    public readonly connectedSession: ConnectedSession,
    public readonly repoUrl: string,
  ) {
    this.page = connectedSession.page;
    const connectedAddress = connectedSession.address;

    if (!connectedAddress) {
      throw new Error('Connected session must have an address');
    }

    this.ownerAddress = connectedAddress;
  }

  async goto() {
    await this.page.getByTestId('search-button').click();
    await this.page
      .getByRole('textbox', { name: 'Search claimed projects, Drip' })
      .fill(this.repoUrl);

    const repoUserAndName = this.repoUrl.split('/').slice(-2).join('/');

    await this.page
      .getByTestId('search-results')
      .getByRole('link', { name: repoUserAndName })
      .press('Enter');

    // await navigation
    await this.page.waitForURL(
      `http://localhost:5173/app/projects/github/${repoUserAndName}?exact`,
    );
  }

  async checkIfClaimed() {
    await this.goto();

    // wait for the repo name to appear, which is the indicator that the project page has loaded
    const repoName = this.repoUrl.split('/').slice(-2).join('/');
    await expect(this.page.getByText(repoName).nth(0)).toBeVisible();

    // check if claim project button is visible
    const claimButton = this.page.getByRole('button', { name: 'Claim project' });
    const count = await claimButton.count();

    this.claimed = count === 0;

    return this.claimed;
  }

  async populateAccountId() {
    const gqlClient = new GraphQLClient('http://localhost:8080', {
      headers: {
        Authorization: `Bearer 123`,
      },
    });

    const accountIdResult = await gqlClient.request(`
      query GetAccountId {
        projectByUrl(url: "${this.repoUrl}", chains: [LOCALTESTNET]) {
          account {
            accountId
          }
        }
      }`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.accountId = (accountIdResult as any).projectByUrl.account.accountId;

    if (!this.accountId) {
      throw new Error(`Account ID not found for project ${this.repoUrl}`);
    }

    return this.accountId;
  }

  async claim() {
    await this.page.getByRole('link', { name: 'Projects' }).click();
    await this.page.getByRole('button', { name: 'Claim project' }).click();
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('textbox', { name: 'Paste your GitHub project URL' }).click();
    await this.page
      .getByRole('textbox', { name: 'Paste your GitHub project URL' })
      .fill(this.repoUrl);
    await this.page.getByRole('textbox', { name: 'Paste your GitHub project URL' }).press('Enter');
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByText('I edited the FUNDING.json file').click();
    await this.page.getByRole('button', { name: 'Verify now' }).click();
    await this.page.getByRole('textbox').first().click();
    await this.page.getByRole('textbox').first().fill('100');
    await this.page.getByRole('textbox').first().press('Enter');
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click();
    await this.page.getByRole('button', { name: 'Confirm in wallet' }).click();

    await expect(this.page.getByTestId('current-tx')).toContainText('Finalizing verification', {
      timeout: 60_000,
    });

    const accountId = await this.populateAccountId();

    // trigger the fake oracle
    await execa`npm run dev:docker:update-repo-owner -- --accountId ${accountId} --ownerAddress ${this.ownerAddress}`;

    await expect(this.page.getByText('Set project splits and metadata')).toBeVisible();

    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click({ timeout: 60000 });
    await this.page.getByRole('link', { name: 'View your project' }).click();

    const repoName = this.repoUrl.split('/').slice(-2).join('/');

    await this.page.waitForURL(`http://localhost:5173/app/projects/github/${repoName}?exact`);
    await expect(this.page.getByText(repoName).nth(0)).toBeVisible();
    await expect(this.page.getByText('Splits', { exact: true })).toBeVisible();
  }

  async claimIfUnclaimed() {
    const isClaimed = await this.checkIfClaimed();

    if (isClaimed) {
      await this.goto();
    } else {
      await this.claim();
    }
  }
}
