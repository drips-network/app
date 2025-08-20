import { test as base, expect } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { RpgfRound } from './rpgf/fixtures/RpgfRound';
import { Project } from './fixtures/Project';

const test = base
  .extend<{
    connectedSession: ConnectedSession;
    connectedSession2: ConnectedSession;
    connectedSession3: ConnectedSession;
    connectedSession4: ConnectedSession;
  }>({
    connectedSession: async ({ page }, use) => {
      const connectedSession = new ConnectedSession(page, TEST_ADDRESSES[0]);
      await connectedSession.goto();
      await connectedSession.connect();

      await use(connectedSession);
    },
    connectedSession2: async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const connectedSession2 = new ConnectedSession(page, TEST_ADDRESSES[1]);
      await connectedSession2.goto();
      await connectedSession2.connect();

      await use(connectedSession2);
    },
    connectedSession3: async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const connectedSession2 = new ConnectedSession(page, TEST_ADDRESSES[2]);
      await connectedSession2.goto();
      await connectedSession2.connect();

      await use(connectedSession2);
    },
    connectedSession4: async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const connectedSession2 = new ConnectedSession(page, TEST_ADDRESSES[2]);
      await connectedSession2.goto();
      await connectedSession2.connect();

      await use(connectedSession2);
    },
  })
  .extend<{ rpgfRound: RpgfRound; rpgfRound2: RpgfRound }>({
    rpgfRound: async ({ connectedSession }, use) => {
      await use(new RpgfRound(connectedSession));
    },
    rpgfRound2: async ({ connectedSession2 }, use) => {
      await use(new RpgfRound(connectedSession2));
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

  test('applying to a round', async ({ rpgfRound, connectedSession2 }) => {
    const project = new Project(connectedSession2, 'https://github.com/efstajas/drips-test-repo-2');
    await project.claimIfUnclaimed();

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
    await rpgfRound.gotoRpgfPage();
    await rpgfRound.navigateToRoundOrDraft();

    await rpgfRound.applyToRound({
      withProject: project,
    });
  });

  test('application visibility, specifically private fields', async ({
    rpgfRound,
    connectedSession3,
  }) => {
    const project = new Project(connectedSession3, 'https://github.com/efstajas/drips-test-repo-3');
    await project.claimIfUnclaimed();

    await rpgfRound.logIn();

    const roundName = 'application visibility test';
    const roundSlug = 'e2e-test-round-application-visibility';

    await rpgfRound.createDraft({
      name: roundName,
      urlSlug: roundSlug,
      emoji: '🗳️',
      voterAddresses: [TEST_ADDRESSES[3], TEST_ADDRESSES[4]],
    });

    await rpgfRound.publishRound();

    await rpgfRound.forceRoundIntoState('intake');
    await rpgfRound.gotoRpgfPage();
    await rpgfRound.navigateToRoundOrDraft();

    const applicationId = await rpgfRound.applyToRound({
      withProject: project,
      applicationTitle: 'Visibility Test Application',
    });

    // Ensure the application is invisible when logged out
    const user2page = connectedSession3.page;

    // this logs the user out
    await connectedSession3.goto();

    await rpgfRound.gotoRpgfPage(user2page);

    await user2page.getByRole('link', { name: roundName }).click();

    // ensure the application is not visible
    await expect(user2page.getByText('Visibility Test Application')).not.toBeVisible();

    // approve the application fromt the 1st user

    await rpgfRound.approveAndDenyApplications({
      approveApplicationIds: [applicationId],
      denyApplicationIds: [],
    });

    // ensure the application is now visible to the 2nd user, but without private fields
    await connectedSession3.goto();

    await rpgfRound.gotoRpgfPage(user2page);
    await user2page.getByRole('link', { name: roundName }).click();

    await user2page.getByRole('link', { name: 'Visibility Test Application' }).click();
    await user2page.waitForURL(`**/applications/${applicationId}`);

    await expect(user2page.getByText('Visibility Test Application').first()).toBeVisible();

    // check private field name Test Testerson is not visible
    await expect(user2page.getByText('Test Testerson')).not.toBeVisible();
  });

  test('approving and denying applications', async ({ rpgfRound, connectedSession4 }) => {
    const project = new Project(connectedSession4, 'https://github.com/efstajas/drips-test-repo-4');
    await project.claimIfUnclaimed();

    await rpgfRound.logIn();

    const roundName = 'approving & denying test';
    const roundSlug = 'e2e-test-round-approving-denying';

    await rpgfRound.createDraft({
      name: roundName,
      urlSlug: roundSlug,
      emoji: '🚔',
      voterAddresses: [TEST_ADDRESSES[3], TEST_ADDRESSES[4]],
    });

    await rpgfRound.publishRound();

    await rpgfRound.forceRoundIntoState('intake');
    await rpgfRound.gotoRpgfPage();
    await rpgfRound.navigateToRoundOrDraft();

    const applicationId1 = await rpgfRound.applyToRound({
      withProject: project,
      applicationTitle: 'Test Application',
    });

    const applicationId2 = await rpgfRound.applyToRound({
      withProject: project,
      applicationTitle: 'Test Application 2',
    });

    await rpgfRound.approveAndDenyApplications({
      approveApplicationIds: [applicationId1],
      denyApplicationIds: [applicationId2],
    });
  });
});
