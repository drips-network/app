import { type Page, expect } from '@playwright/test';
import { execa } from 'execa';
import { GraphQLClient } from 'graphql-request';

export class Project {
  constructor(
    public readonly page: Page,
    public readonly repoUrl: string,
  ) {}

  async goto() {
    await this.page.getByTestId('search-button').click();
    await this.page
      .getByRole('textbox', { name: 'Search claimed projects, Drip' })
      .fill(this.repoUrl);

    const repoUserAndName = this.repoUrl.split('/').slice(-2).join('/');

    await this.page.getByRole('link', { name: repoUserAndName }).press('Enter');
  }

  async claim(withAddress: string) {
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
    const accountId = (accountIdResult as any).projectByUrl.account.accountId;

    // trigger the fake oracle
    await execa`npm run dev:docker:update-repo-owner -- --accountId ${accountId} --ownerAddress ${withAddress}`;

    await expect(this.page.getByText('Set project splits and metadata')).toBeVisible();

    await this.page.getByRole('button', { name: 'Continue' }).nth(0).click({ timeout: 60000 });
    await this.page.getByRole('link', { name: 'View your project' }).click();

    await this.page.waitForURL(
      'http://localhost:5173/app/projects/github/efstajas/drips-test-repo-10?exact',
    );
    await expect(this.page.getByText('drips-test-repo-10').nth(0)).toBeVisible();
    await expect(this.page.getByText('Splits', { exact: true })).toBeVisible();
  }
}
