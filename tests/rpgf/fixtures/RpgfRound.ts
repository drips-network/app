import { type Page, expect } from '@playwright/test';
import type { ConnectedSession } from '../../fixtures/ConnectedSession';
import type { Project } from '../../fixtures/Project';
import type { RoundState } from '$lib/utils/rpgf/types/round';

const RPGF_API_URL = 'http://localhost:5000/api';

export class RpgfRound {
  public draftId: string | null = null;
  public name: string | null = null;
  public urlSlug: string | null = null;
  public published: boolean = false;
  public readonly page: Page;
  public signedIn: boolean = false;

  constructor(public readonly connectedSession: ConnectedSession) {
    this.page = connectedSession.page;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.page.evaluate(() => ((window as any).disableHighlights = true));
  }

  async gotoRpgfPage(page = this.page) {
    await page.getByTestId('sidenav-item-RetroPGF').click();

    // wait for the URL to either be /app/rpgf or /app/connect using regex
    await page.waitForURL(/\/app\/rpgf(\/|$)|\/app\/connect/);
  }

  async logIn(connectedSession = this.connectedSession) {
    const page = connectedSession.page;

    await this.gotoRpgfPage(page);

    await page.getByRole('button', { name: 'Sign in' }).click();

    this.signedIn = true;
  }

  async logOut(connectedSession = this.connectedSession) {
    const page = connectedSession.page;

    await connectedSession.disconnect();

    // wait for connect button to be visible again
    await page.getByRole('button', { name: 'Connect', exact: true }).waitFor();

    this.signedIn = false;
  }

  private formatDateForInput(date: Date): string {
    // format as YYYY-MM-DD HH:MM:SS
    return date.toISOString().replace('T', ' ').slice(0, 19);
  }

  async createDraft({
    name,
    description,
    urlSlug,
    emoji = '🐘',
    schedule = {
      applicationPeriodStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      applicationPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
      votingPeriodStart: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 1 week and 1 day later
      votingPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 2 weeks later
      fundingPeriodStart: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 2 weeks and 1 day later
    },
    voterAddresses = [],
    votingSettings = {
      votesPerVoter: 1000,
      maximumVotesPerProject: 100,
    },
    categories = [
      {
        name: 'Default',
      },
    ],
  }: {
    name: string;
    description?: string;
    urlSlug: string;
    emoji?: string;
    schedule?: {
      applicationPeriodStart: Date;
      applicationPeriodEnd: Date;
      votingPeriodStart: Date;
      votingPeriodEnd: Date;
      fundingPeriodStart: Date;
    };
    voterAddresses?: string[];
    votingSettings?: {
      votesPerVoter: number;
      maximumVotesPerProject: number;
      badgeholderGuidelinesLink?: string;
    };
    categories?: {
      name: string;
    }[];
  }): Promise<string> {
    this.name = name;
    this.urlSlug = urlSlug;

    if (!this.signedIn) {
      throw new Error('User not signed in. Please call logIn() first.');
    }

    await this.gotoRpgfPage();

    await this.page.getByRole('button', { name: 'New round' }).click();

    await this.page.waitForURL('**/app/rpgf/rounds/*');

    // Page title and header meta
    await expect(this.page.getByText('Unnamed round')).toHaveCount(2);

    await this.page.getByRole('link', { name: 'Settings' }).nth(0).click();
    await this.page.getByRole('textbox', { name: 'Round name*' }).click();
    await this.page.getByRole('textbox', { name: 'Round name*' }).fill(name);

    // emoji
    await this.page.getByPlaceholder('Search').fill(emoji);
    await this.page.getByRole('img', { name: emoji }).click();

    // URL slug
    await this.page.getByRole('textbox', { name: 'localtestnet.drips.network/' }).fill(urlSlug);
    await this.page.getByRole('textbox', { name: 'localtestnet.drips.network/' }).blur();

    if (description) {
      await this.page.getByRole('textbox', { name: 'Description' }).fill(description);
    }

    await this.page.getByRole('button', { name: 'Save changes' }).click();

    // schedule
    await this.page.getByRole('link', { name: 'Schedule' }).nth(0).click();
    await this.page
      .getByRole('textbox', { name: 'Application intake start*' })
      .fill(this.formatDateForInput(schedule.applicationPeriodStart));
    await this.page
      .getByRole('textbox', { name: 'Application intake end*' })
      .fill(this.formatDateForInput(schedule.applicationPeriodEnd));
    await this.page
      .getByRole('textbox', { name: 'Voting start*' })
      .fill(this.formatDateForInput(schedule.votingPeriodStart));
    await this.page
      .getByRole('textbox', { name: 'Voting end*' })
      .fill(this.formatDateForInput(schedule.votingPeriodEnd));
    await this.page
      .getByRole('textbox', { name: 'Distribution start*' })
      .fill(this.formatDateForInput(schedule.fundingPeriodStart));

    await this.page.getByRole('button', { name: 'Save changes' }).click();

    // voting settings
    await this.page.getByRole('link', { name: 'Voting' }).nth(0).click();
    await this.page
      .getByRole('spinbutton', { name: 'Votes per voter*' })
      .fill(votingSettings.votesPerVoter.toString());
    await this.page
      .getByRole('spinbutton', { name: 'Maximum votes per project*' })
      .fill(votingSettings.maximumVotesPerProject.toString());
    if (votingSettings.badgeholderGuidelinesLink) {
      await this.page
        .getByRole('textbox', { name: 'Badgeholder guidelines link' })
        .fill(votingSettings.badgeholderGuidelinesLink);
    }

    const addField = this.page.getByPlaceholder('ETH address');
    for (const address of voterAddresses) {
      await addField.fill(address);

      const addButton = this.page.getByRole('button', { name: 'Add' });

      await expect(addButton).toBeEnabled();
      await this.page.getByRole('button', { name: 'Add' }).dispatchEvent('click');

      // wait for add field to be enabled again
      await expect(addField).toBeEnabled();
    }

    if (voterAddresses.length > 0) {
      await this.page.getByRole('button', { name: 'Save changes' }).click();
    }

    // Configure application forms

    if (categories.length > 0) {
      await this.page.getByTestId('sidenav-item-Applications').click();
      await this.page.getByRole('button', { name: 'Create new form' }).click();
      await this.page.getByRole('textbox', { name: 'Enter a unique name for this' }).click();
      await this.page.getByRole('textbox', { name: 'Enter a unique name for this' }).click();
      await this.page
        .getByRole('textbox', { name: 'Enter a unique name for this' })
        .fill('Default form');
      await this.page.getByRole('button', { name: 'Create form' }).click();

      await this.page.getByRole('button', { name: 'Add first field' }).click();
      await this.page.getByRole('button', { name: 'Text Area A multi-line text' }).click();
      await this.page.getByRole('textbox', { name: 'Label*' }).fill('Description');
      await this.page
        .getByRole('textbox', { name: 'A unique identifier for this' })
        .fill('description');
      await this.page
        .getByRole('textbox', { name: 'Description (Markdown)' })
        .fill('Please consicely describe your project');
      await this.page
        .locator('label')
        .filter({ hasText: 'Required field' })
        .locator('div')
        .nth(1)
        .click();
      await this.page.getByRole('button', { name: 'Save', exact: true }).click();
      await this.page.locator('.add-item-row > .button').click();
      await this.page.getByRole('button', { name: 'Text Field A single-line text' }).click();
      await this.page.getByRole('textbox', { name: 'Label*' }).fill('Name');
      await this.page
        .getByRole('textbox', { name: 'Description (Markdown)' })
        .fill('Please enter your name.');
      await this.page.getByRole('textbox', { name: 'A unique identifier for this' }).fill('name');
      await this.page
        .locator('label')
        .filter({ hasText: 'Required field' })
        .locator('div')
        .nth(1)
        .click();
      await this.page
        .locator('label')
        .filter({ hasText: 'Private field' })
        .locator('div')
        .first()
        .click();
      await this.page.getByRole('button', { name: 'Save', exact: true }).click();
      await this.page.locator('div:nth-child(2) > .add-item-row > .button').click();
      await this.page.getByRole('button', { name: 'URL Field A field for' }).click();
      await this.page.getByRole('textbox', { name: 'Label*' }).fill('Website');
      await this.page
        .getByRole('textbox', { name: 'Description (Markdown)' })
        .fill('Please enter the URL to your website.');
      await this.page.getByRole('textbox', { name: 'A unique identifier for this' }).fill('web');
      await this.page.getByRole('button', { name: 'Save', exact: true }).click();
      await this.page.locator('div:nth-child(3) > .add-item-row > .button').click();
      await this.page.getByRole('button', { name: 'Email Field A field for' }).click();
      await this.page.getByRole('textbox', { name: 'Label*' }).fill('Email');
      await this.page
        .getByRole('textbox', { name: 'Description (Markdown)' })
        .fill('Please enter your email');
      await this.page
        .locator('label')
        .filter({ hasText: 'Required field' })
        .locator('div')
        .first()
        .click();
      await this.page
        .locator('label')
        .filter({ hasText: 'Private field' })
        .locator('div')
        .nth(1)
        .click();
      await this.page.locator('form div').filter({ hasText: 'Save' }).first().click();
      await this.page.getByRole('textbox', { name: 'A unique identifier for this' }).fill('email');
      await this.page.getByRole('button', { name: 'Save', exact: true }).click();

      await this.page.getByRole('button', { name: 'Save changes' }).click();
      await this.page.waitForTimeout(1000);
      await this.page.getByTestId('sidenav-item-Applications').click();
      await this.page.getByRole('button', { name: 'Add category' }).click();
      await this.page.getByRole('textbox', { name: 'Name*' }).fill('Default');
      await this.page.getByTestId('dropdown').click();
      await this.page.getByRole('option', { name: 'Default form ' }).click();
      await this.page.getByRole('button', { name: 'Create category' }).click();
    }

    // Go back to draft page
    await this.page.getByRole('link', { name }).click();

    await this.page.waitForURL('**/app/rpgf/rounds/*');

    // return the last part of the URL as the draft ID
    const url = this.page.url();
    const urlParts = url.split('/');
    this.draftId = urlParts[urlParts.length - 1];
    return this.draftId;
  }

  async navigateToRoundOrDraft() {
    if (!this.signedIn) {
      throw new Error('User not signed in. Please call logIn() first.');
    }
    if (!this.name) {
      throw new Error('Draft name not set. Please create a draft first.');
    }

    await this.gotoRpgfPage();

    // Find the draft by name
    const draftLocator = this.page.getByRole('link', { name: this.name });
    await expect(draftLocator.nth(0)).toBeVisible();

    // Click on the draft to open it
    await draftLocator.nth(0).click();
  }

  async deleteDraft() {
    if (!this.signedIn) {
      throw new Error('User not signed in. Please call logIn() first.');
    }
    if (!this.name) {
      throw new Error('Draft name not set. Please create a draft first.');
    }

    await this.navigateToRoundOrDraft();

    // Delete the draft
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Yes, continue' }).click();

    // wait until we're back on /app/rpgf
    await this.page.waitForURL('**/app/rpgf');

    // Verify deletion
    await expect(this.page.getByRole('link', { name: this.name })).not.toBeVisible();
  }

  async publishRound() {
    if (!this.signedIn) {
      throw new Error('User not signed in. Please call logIn() first.');
    }
    if (!this.name || !this.urlSlug) {
      throw new Error('Draft not set. Please create a draft first.');
    }

    await this.gotoRpgfPage();

    await this.page.getByRole('link', { name: this.name }).click();

    // Publish the round0x90F79bf6EB2c4f870365E785982E1f101E93b906
    await this.page.getByRole('button', { name: 'Publish' }).click();
    await this.page.getByRole('button', { name: 'Publish round' }).nth(0).click();
    await this.page.getByRole('button', { name: 'Got it' }).click();

    // Ensure we're on the round page. wait for navigation, then check for the name
    await this.page.waitForURL(`**/app/rpgf/rounds/${this.urlSlug}`);
    await expect(this.page.getByRole('heading', { name: this.name })).toBeVisible();

    this.published = true;
  }

  async applyToRound({
    withProject,
    applicationTitle,
  }: {
    withProject: Project;
    applicationTitle?: string;
  }) {
    if (!this.name) {
      throw new Error('Draft not set. Please create a draft first.');
    }

    const page = withProject.page;

    await this.gotoRpgfPage(page);

    // if we're on the connect round, log in
    if (page.url().includes('/app/connect')) {
      await this.logIn(withProject.connectedSession);
      await this.gotoRpgfPage(page);
    }

    // click on the round
    await page.getByRole('link', { name: this.name }).click();

    // click on apply CTA
    await page.getByRole('link', { name: 'Apply now' }).click();

    // select the project
    await page.getByTestId(`item-${withProject.accountId}`).click();

    await page
      .locator('input[type="text"]')
      .first()
      .fill(applicationTitle ?? 'Test Application');

    // select default category by clicking it
    await page.getByText('Default').first().click();

    await page.getByRole('textbox', { name: 'Please consicely describe' }).fill('Test description');
    await page.getByRole('textbox', { name: 'Please enter your name.' }).fill('Test Testerson');
    await page.getByRole('textbox', { name: 'Please enter your email' }).fill('test@test.com');
    await page
      .getByRole('textbox', { name: 'Please enter the URL to your' })
      .fill('https://test.com');

    await page.getByRole('button', { name: 'Submit application' }).click();
    await page.getByRole('button', { name: 'Submit application' }).nth(0).click();

    await page.getByRole('link', { name: 'View your application' }).click();

    // wait until we land on application page by checking for a valid UUID in the URL
    await page.waitForURL(
      /\/applications\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    );

    // parse the application ID from the URL
    const url = page.url();
    const urlParts = url.split('/');
    const applicationId = urlParts[urlParts.length - 1];

    return applicationId;
  }

  async approveAndDenyApplications({
    approveApplicationIds,
    denyApplicationIds,
  }: {
    approveApplicationIds: string[];
    denyApplicationIds: string[];
  }) {
    if (!this.name || !this.urlSlug) {
      throw new Error('Draft not set. Please create a draft first.');
    }

    await this.navigateToRoundOrDraft();

    // Go to the applications tab
    await this.page.getByRole('link', { name: 'View all' }).first().click();

    // Approve applications
    for (const id of approveApplicationIds) {
      await this.page
        .getByTestId(`application-line-item-${id}`)
        .getByLabel('Approve application')
        .click();
    }

    // Deny applications
    for (const id of denyApplicationIds) {
      await this.page
        .getByTestId(`application-line-item-${id}`)
        .getByLabel('Reject application')
        .click();
    }

    // Ensure correct count of applications is displayed
    await expect(this.page.getByRole('main')).toContainText(
      `Approve ${approveApplicationIds.length} • Reject ${denyApplicationIds.length}`,
    );

    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.getByRole('button', { name: 'Yes, continue' }).click();

    // Wait for each of the application line items to reflect the new state
    for (const id of approveApplicationIds) {
      await expect(this.page.getByTestId(`application-line-item-${id}`)).toContainText('Approved');
    }
    for (const id of denyApplicationIds) {
      await expect(this.page.getByTestId(`application-line-item-${id}`)).toContainText('Rejected');
    }
  }

  async forceRoundIntoState(desiredState: RoundState) {
    if (!this.name || !this.urlSlug) {
      throw new Error('Draft not set. Please create a draft first.');
    }

    await fetch(`${RPGF_API_URL}/testing/force-round-state`, {
      method: 'POST',
      body: JSON.stringify({
        roundSlug: this.urlSlug,
        desiredState,
      }),
    });

    await this.navigateToRoundOrDraft();
  }

  async deleteRound() {
    if (!this.urlSlug) {
      throw new Error('Draft not set. Please create a draft first.');
    }

    await fetch(`${RPGF_API_URL}/testing/force-delete-round`, {
      method: 'POST',
      body: JSON.stringify({
        roundSlug: this.urlSlug,
      }),
    });

    await this.gotoRpgfPage();
  }
}
