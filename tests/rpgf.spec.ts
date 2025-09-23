import { test as base, expect, type Page } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { RpgfRound } from './rpgf/fixtures/RpgfRound';
import { Project } from './fixtures/Project';
import { projectClaimManager } from './fixtures/ProjectClaimManager';
import workerUniqueString from './utils/worker-unique-string';
import path from 'node:path';
import { readFile, unlink } from 'node:fs/promises';

function disableHighlights(page: Page) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page.addInitScript(() => ((window as any).disableHighlights = true));
}

const test = base
  .extend<{
    connectedSession: ConnectedSession;
    connectedSession2: ConnectedSession;
    connectedSession3: ConnectedSession;
    connectedSession4: ConnectedSession;
  }>({
    connectedSession: async ({ page }, use) => {
      disableHighlights(page);
      const connectedSession = new ConnectedSession(page, TEST_ADDRESSES[0]);
      await connectedSession.goto();
      await connectedSession.connect();

      await use(connectedSession);
    },
    connectedSession2: async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      disableHighlights(page);
      const connectedSession2 = new ConnectedSession(page, TEST_ADDRESSES[1]);
      await connectedSession2.goto();
      await connectedSession2.connect();

      await use(connectedSession2);
    },
    connectedSession3: async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      disableHighlights(page);
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
    // 3 min
    test.setTimeout(180000);
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

    // double check we see the 404 page instead of draft name
    await rpgfRound2.page.goto(`http://localhost:5173/app/rpgf/rounds/${draftId}`);
    await expect(rpgfRound2.page.getByText('draft visibility test')).not.toBeVisible();
    await expect(rpgfRound2.page.getByText('Error 404')).toBeVisible();
  });
});

test.describe('rounds', () => {
  test.beforeEach(() => {
    // 3 min
    test.setTimeout(180000);
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

  test('csv export of applications', async ({
    rpgfRound,
    connectedSession2,
    project1,
  }, testInfo) => {
    await rpgfRound.logIn();

    const roundName = workerUniqueString(testInfo, 'csv export test');
    const roundSlug = workerUniqueString(testInfo, 'e2e-test-round-csv-export');

    await rpgfRound.createDraft({
      name: roundName,
      urlSlug: roundSlug,
      emoji: '📁',
      voterAddresses: [TEST_ADDRESSES[3], TEST_ADDRESSES[4]],
    });

    await rpgfRound.publishRound();

    await rpgfRound.forceRoundIntoState('intake');
    await rpgfRound.gotoRpgfPage();
    await rpgfRound.navigateToRoundOrDraft();

    const applicationId = await rpgfRound.applyToRound({
      withProject: project1,
      applicationTitle: 'CSV Test Application',
    });

    const downloadCsv = async (check: (fileContent: string) => Promise<void>, page: Page) => {
      await connectedSession2.goto();
      await rpgfRound.navigateToRoundOrDraft(page);

      // click first "View all" button to go to applications page
      await page.getByRole('link', { name: 'View all' }).first().click();

      // download the csv
      await page.getByRole('button', { name: 'Download CSV' }).click();
      const download = await page.waitForEvent('download');

      const fileName = workerUniqueString(testInfo, 'export-user2') + '.csv';
      const filePath = path.join(process.cwd(), 'test-data', fileName);

      await download.saveAs(filePath);

      const fileContent = await readFile(filePath, 'utf-8');

      await check(fileContent);

      // delete the file
      await unlink(filePath);
    };

    // ensure the admin's download contains the application with full details
    await downloadCsv(async (fileContent) => {
      expect(fileContent).toContain('CSV Test Application');
      expect(fileContent).toContain('ID,State,');
      expect(fileContent).toContain('pending');

      // make sure the public fields are included
      expect(fileContent).toContain(',web,');
      expect(fileContent).toContain('https://test.com');
      expect(fileContent).toContain(',description,');
      expect(fileContent).toContain('Test description');

      // make sure the private fields are included
      expect(fileContent).toContain(',name,');
      expect(fileContent).toContain(',email,');
      expect(fileContent).toContain('Test Testerson');
      expect(fileContent).toContain('test@test.com');
    }, rpgfRound.page);

    // ensure user 2's export does not contain the application
    await downloadCsv(async (fileContent) => {
      expect(fileContent).not.toContain('CSV Test Application');
      expect(fileContent).toContain('ID,State,');
    }, connectedSession2.page);

    // ensure that the application data is included in user2 export after approving the application

    await rpgfRound.approveAndDenyApplications({
      approveApplicationIds: [applicationId],
      denyApplicationIds: [],
    });

    await downloadCsv(async (fileContent) => {
      expect(fileContent).toContain('CSV Test Application');
      expect(fileContent).toContain('ID,State,');
      expect(fileContent).toContain('approved');

      // make sure the public fields are included
      expect(fileContent).toContain(',web,');
      expect(fileContent).toContain('https://test.com');
      expect(fileContent).toContain(',description,');
      expect(fileContent).toContain('Test description');

      // make sure the private fields are not included
      expect(fileContent).not.toContain(',name,');
      expect(fileContent).not.toContain(',email,');
      expect(fileContent).not.toContain('Test Testerson');
      expect(fileContent).not.toContain('test@test.com');
    }, connectedSession2.page);
  });
});
