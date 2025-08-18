import { test as base, expect } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { RpgfRound } from './rpgf/fixtures/RpgfRound';
import { Project } from './fixtures/Project';

const test = base
  .extend<{ connectedSession: ConnectedSession; connectedSession2: ConnectedSession }>({
    connectedSession: async ({ page }, use) => {
      const connectedSession = new ConnectedSession(page, TEST_ADDRESSES[0]);
      await connectedSession.goto();

      await use(connectedSession);
    },
    connectedSession2: async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const connectedSession2 = new ConnectedSession(page, TEST_ADDRESSES[1]);
      await connectedSession2.goto();

      await use(connectedSession2);
    },
  })
  .extend<{ rpgfRound: RpgfRound; rpgfRound2: RpgfRound; project: Project }>({
    rpgfRound: async ({ connectedSession }, use) => {
      await use(new RpgfRound(connectedSession));
    },
    rpgfRound2: async ({ connectedSession2 }, use) => {
      await use(new RpgfRound(connectedSession2));
    },
    // Claim a project with another test address
    project: async ({ connectedSession2 }, use) => {
      const project = new Project(
        connectedSession2,
        'https://github.com/efstajas/drips-test-repo-12',
      );
      await project.claim();

      await use(project);
    },
  });

test.describe('drafts', () => {
  test.afterEach(async ({ rpgfRound }) => {
    await rpgfRound.deleteDraft();
  });

  test('draft creation and deletion', async ({ rpgfRound }) => {
    await rpgfRound.logIn();

    await rpgfRound.createDraft({
      name: 'draft creation',
      urlSlug: 'e2e-test-round',
      emoji: '🍝',
    });
  });

  test('draft is invisible to other users', async ({ rpgfRound, rpgfRound2 }) => {
    await rpgfRound.logIn();

    const DRAFT_NAME = 'draft visibility';

    const draftId = await rpgfRound.createDraft({
      name: DRAFT_NAME,
      urlSlug: 'draft-visibility-test',
    });

    // ensure another user doesn't see the draft
    await rpgfRound2.gotoRpgfPage();
    await rpgfRound2.logIn();
    await expect(rpgfRound2.page.getByText(DRAFT_NAME)).not.toBeVisible();

    await rpgfRound2.logOut();

    // double check we see the connect page instead of draft name
    await rpgfRound2.page.goto(`http://localhost:5173/app/rpgf/drafts/${draftId}`);
    await expect(rpgfRound2.page.getByText('draft visibility test')).not.toBeVisible();
    await expect(
      rpgfRound2.page.getByText('Connect your Ethereum wallet to access Drips RetroPGF.'),
    ).toBeVisible();
  });
});

test.describe('rounds', () => {
  test.afterEach(async ({ rpgfRound }) => {
    if (!rpgfRound.signedIn) {
      await rpgfRound.logIn();
    }

    if (rpgfRound.published) {
      await rpgfRound.deleteRound();
    } else {
      await rpgfRound.deleteDraft();
    }
  });

  test('round publishing', async ({ rpgfRound }) => {
    await rpgfRound.logIn();

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

  test('applying to a round', async ({ rpgfRound, project }) => {
    await rpgfRound.logIn();

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
    await rpgfRound.logOut();

    await rpgfRound.applyToRound({
      withProject: project,
    });
  });
});
