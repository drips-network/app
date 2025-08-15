import { test as base, expect } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { RpgfRound } from './rpgf/fixtures/RpgfRound';

const test = base
  .extend<{ connectedSession: ConnectedSession }>({
    connectedSession: async ({ page }, use) => {
      await use(new ConnectedSession(page));
    },
  })
  .extend<{ rpgfRound: RpgfRound }>({
    rpgfRound: async ({ page, connectedSession }, use) => {
      await use(new RpgfRound(page, connectedSession));
    },
  });

test.describe('drafts', () => {
  test.afterEach(async ({ rpgfRound }) => {
    await rpgfRound.deleteDraft();
  });

  test('draft creation and deletion', async ({ rpgfRound }) => {
    await rpgfRound.logIn(TEST_ADDRESSES[0]);

    await rpgfRound.createDraft({
      name: 'draft creation',
      urlSlug: 'e2e-test-round',
      emoji: '🍝',
    });
  });

  test('draft is invisible to other users', async ({ page, rpgfRound, connectedSession }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const ogAddress = TEST_ADDRESSES[0];
    await rpgfRound.logIn(ogAddress);

    const DRAFT_NAME = 'draft visibility';

    const draftId = await rpgfRound.createDraft({
      name: DRAFT_NAME,
      urlSlug: 'draft-visibility-test',
    });

    // Log out and log in as a different user
    await rpgfRound.logOut();
    await rpgfRound.logIn(TEST_ADDRESSES[1]); // Use a different address for the new user

    // Check that the draft is not visible to the new user
    await rpgfRound.gotoRpgfPage();
    await expect(page.getByText(DRAFT_NAME)).not.toBeVisible();

    // double check we see the connect page instead of draft name
    await page.goto(`http://localhost:5173/app/rpgf/drafts/${draftId}`);
    await expect(page.getByText('draft visibility test')).not.toBeVisible();
    await expect(page.getByText('Connect wallet & sign in')).toBeVisible();

    // go back to the original user
    await connectedSession.goto();
    await rpgfRound.logIn(ogAddress); // Use the original address

    // Check that the draft is still visible to the original user
    await rpgfRound.gotoRpgfPage();
    await expect(page.getByText(DRAFT_NAME)).toBeVisible();
  });
});

test.describe('rounds', () => {
  test.afterEach(async ({ rpgfRound }) => {
    if (rpgfRound.published) {
      await rpgfRound.deleteRound();
    } else {
      await rpgfRound.deleteDraft();
    }
  });

  test('round publishing', async ({ rpgfRound }) => {
    const roundCreator = TEST_ADDRESSES[0];

    await rpgfRound.logIn(roundCreator);

    const roundName = 'publish test';
    const roundSlug = 'e2e-test-round-publish';

    await rpgfRound.createDraft({
      name: roundName,
      urlSlug: roundSlug,
      emoji: '💦',
      voterAddresses: [TEST_ADDRESSES[3], TEST_ADDRESSES[4]],
    });

    await rpgfRound.publishRound();
  });

  test('applying to a round', async ({ rpgfRound }) => {
    const roundCreator = TEST_ADDRESSES[0];

    await rpgfRound.logIn(roundCreator);

    const roundName = 'applying test';
    const roundSlug = 'e2e-test-round-voting';

    await rpgfRound.createDraft({
      name: roundName,
      urlSlug: roundSlug,
      emoji: '🗳️',
      voterAddresses: [TEST_ADDRESSES[3], TEST_ADDRESSES[4]],
    });

    await rpgfRound.publishRound();

    await rpgfRound.forceRoundIntoState('intake');

    // Log in as some other wallet to submit an application
  });
});
