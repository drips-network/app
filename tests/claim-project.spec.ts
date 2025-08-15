import { test as base } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { Project } from './fixtures/Project';

const test = base.extend<{ connectedSession: ConnectedSession; project: Project }>({
  connectedSession: async ({ page }, use) => {
    await use(new ConnectedSession(page));
  },
  project: async ({ page }, use) => {
    await use(new Project(page, 'https://github.com/efstajas/drips-test-repo-10'));
  },
});

test('claim project flow', async ({ connectedSession, project }) => {
  test.setTimeout(120_000);

  await connectedSession.goto();
  await connectedSession.connect(TEST_ADDRESSES[0]);

  await project.claim(TEST_ADDRESSES[0]);
});
