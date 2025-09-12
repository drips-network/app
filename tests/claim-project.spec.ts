import { test as base } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { Project } from './fixtures/Project';
import { projectClaimManager } from './fixtures/ProjectClaimManager';

const test = base.extend<{ connectedSession: ConnectedSession; project: Project }>({
  connectedSession: async ({ page }, use) => {
    const connectedSession = new ConnectedSession(page, TEST_ADDRESSES[0]);
    await connectedSession.goto();
    await connectedSession.connect();

    await use(connectedSession);
  },
  project: async ({ connectedSession }, use) => {
    await use(new Project(connectedSession, projectClaimManager));
  },
});

test('claim project flow', async ({ project }) => {
  test.setTimeout(120_000);

  await project.claim();
});
