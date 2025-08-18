import { type Page, expect } from '@playwright/test';
import { TEST_ADDRESSES, type ConnectedSession } from '../../fixtures/ConnectedSession';
import type { RoundState } from '$lib/utils/rpgf/schemas';

const RPGF_API_URL = 'http://localhost:5000/api';

export class RpgfRound {
  public draftId: string | null = null;
  public name: string | null = null;
  public urlSlug: string | null = null;
  public published: boolean = false;
  private signedIn: boolean = false;

  constructor(
    public readonly page: Page,
    public readonly connectedSession: ConnectedSession,
  ) {}

  async gotoRpgfPage() {
    await this.page.getByTestId('sidenav-item-RetroPGF').click();
  }

  async logIn(address = TEST_ADDRESSES[0]) {
    await this.connectedSession.goto();
    await this.connectedSession.connect(address);

    await this.gotoRpgfPage();

    await this.page.getByRole('button', { name: 'Sign in' }).click();

    this.signedIn = true;
  }

  async logOut() {
    await this.connectedSession.disconnect();

    // wait for connect button to be visible again
    await this.page.getByRole('button', { name: 'Connect', exact: true }).waitFor();

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
  }): Promise<string> {
    this.name = name;
    this.urlSlug = urlSlug;

    if (!this.signedIn) {
      throw new Error('User not signed in. Please call logIn() first.');
    }

    await this.gotoRpgfPage();

    await this.page.getByRole('button', { name: 'New round' }).click();
    await expect(this.page.getByText('Unnamed round')).toBeVisible();

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
      await this.page.getByRole('button', { name: 'Add' }).click();

      // wait for add field to be enabled again
      await expect(addField).toBeEnabled();
    }

    if (voterAddresses.length > 0) {
      await this.page.getByRole('button', { name: 'Save changes' }).click();
    }

    // Go back to draft page
    await this.page.getByRole('link', { name }).click();

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
    await expect(draftLocator).toBeVisible();

    // Click on the draft to open it
    await draftLocator.click();
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

    // Publish the round
    await this.page.getByRole('button', { name: 'Publish' }).click();
    await this.page.getByRole('button', { name: 'Publish round' }).nth(0).click();
    await this.page.getByRole('button', { name: 'Got it' }).click();

    // Ensure we're on the round page. wait for navigation, then check for the name
    await this.page.waitForURL(`**/app/rpgf/rounds/${this.urlSlug}`);
    await expect(this.page.getByRole('heading', { name: this.name })).toBeVisible();

    this.published = true;
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
