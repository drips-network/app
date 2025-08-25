import { test as base, expect } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { RpgfRound } from './rpgf/fixtures/RpgfRound';
import { Project } from './fixtures/Project';
import { projectClaimManager } from './fixtures/ProjectClaimManager';
import workerUniqueString from './utils/worker-unique-string';

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
      const connectedSession3 = new ConnectedSession(page, TEST_ADDRESSES[2]);
      await connectedSession3.goto();
      await connectedSession3.connect();

      await use(connectedSession3);
    },
  })
  .extend<{ rpgfRound: RpgfRound; rpgfRound2: RpgfRound; project1: Project; project2: Project }>({
    rpgfRound: async ({ connectedSession }, use) => {
      await use(new RpgfRound(connectedSession));
    },
    rpgfRound2: async ({ connectedSession2 }, use) => {
      await use(new RpgfRound(connectedSession2));
    },
    project1: async ({ connectedSession2 }, use) => {
      const project = new Project(connectedSession2, projectClaimManager);
      await project.claim();
      await use(project);
    },
    project2: async ({ connectedSession3 }, use) => {
      const project = new Project(connectedSession3, projectClaimManager);
      await project.claim();
      await use(project);
    },
  });

test.describe('drafts', () => {
  test.beforeEach(() => {
    test.setTimeout(300000); // 5 minutes
  });

  test.afterEach(async ({ rpgfRound }) => {
    await rpgfRound.deleteDraft();
  });

  test('draft creation and deletion', async ({ rpgfRound }, testInfo) => {
    await rpgfRound.logIn();

    await rpgfRound.createDraft({
      name: workerUniqueString(testInfo, 'draft creation'),
      urlSlug: workerUniqueString(testInfo, 'e2e-test-round'),
      emoji: '🍝',
    });
  });

  test('draft is invisible to other users', async ({ rpgfRound, rpgfRound2 }, testInfo) => {
    await rpgfRound.logIn();

    const DRAFT_NAME = workerUniqueString(testInfo, 'draft visibility');

    const draftId = await rpgfRound.createDraft({
      name: DRAFT_NAME,
      urlSlug: workerUniqueString(testInfo, 'draft-visibility-test'),
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
  test.beforeEach(() => {
    test.setTimeout(300000); // 5 minutes
  });

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

  test('round publishing', async ({ rpgfRound }, testInfo) => {
    await rpgfRound.logIn();

    const roundName = workerUniqueString(testInfo, 'publish test');
    const roundSlug = workerUniqueString(testInfo, 'e2e-test-round-publish');

    await rpgfRound.createDraft({
      name: roundName,
      urlSlug: roundSlug,
      emoji: '💦',
      voterAddresses: [TEST_ADDRESSES[3], TEST_ADDRESSES[4]],
    });

    await rpgfRound.publishRound();
  });

  test('applying to a round', async ({ rpgfRound, project1 }, testInfo) => {
    await rpgfRound.logIn();

    const roundName = workerUniqueString(testInfo, 'applying test');
    const roundSlug = workerUniqueString(testInfo, 'e2e-test-round-applying');

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
      withProject: project1,
    });
  });

  test('application visibility, specifically private fields', async ({
    rpgfRound,
    connectedSession2,
    project1: project,
  }, testInfo) => {
    await rpgfRound.logIn();

    const roundName = workerUniqueString(testInfo, 'application visibility test');
    const roundSlug = workerUniqueString(testInfo, 'e2e-test-round-application-visibility');

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

    // this logs the user out
    await connectedSession2.goto();

    await rpgfRound.gotoRpgfPage(connectedSession2.page);

    await connectedSession2.page.getByRole('link', { name: roundName }).click();

    // ensure the application is not visible
    await expect(connectedSession2.page.getByText('Visibility Test Application')).not.toBeVisible();

    // approve the application fromt the 1st user

    await rpgfRound.approveAndDenyApplications({
      approveApplicationIds: [applicationId],
      denyApplicationIds: [],
    });

    // ensure the application is now visible to the 2nd user, but without private fields
    await connectedSession2.goto();

    await rpgfRound.gotoRpgfPage(connectedSession2.page);
    await connectedSession2.page.getByRole('link', { name: roundName }).click();

    await connectedSession2.page.getByRole('link', { name: 'Visibility Test Application' }).click();
    await connectedSession2.page.waitForURL(`**/applications/${applicationId}`);

    await expect(
      connectedSession2.page.getByText('Visibility Test Application').first(),
    ).toBeVisible();

    // check private field name Test Testerson is not visible
    await expect(connectedSession2.page.getByText('Test Testerson')).not.toBeVisible();
  });

  test('approving and denying applications', async ({ rpgfRound, project1 }, testInfo) => {
    await rpgfRound.logIn();

    const roundName = workerUniqueString(testInfo, 'approving & denying test');
    const roundSlug = workerUniqueString(testInfo, 'e2e-test-round-approving-denying');

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
      withProject: project1,
      applicationTitle: 'Test Application',
    });

    const applicationId2 = await rpgfRound.applyToRound({
      withProject: project1,
      applicationTitle: 'Test Application 2',
    });

    await rpgfRound.approveAndDenyApplications({
      approveApplicationIds: [applicationId1],
      denyApplicationIds: [applicationId2],
    });
  });
});
