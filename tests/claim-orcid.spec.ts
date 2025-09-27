import { test as base } from '@playwright/test';
import { ConnectedSession, TEST_ADDRESSES } from './fixtures/ConnectedSession';
import { Orcid } from './fixtures/Orcid';
import { orcidClaimManager } from './fixtures/OrcidClaimManager';

const test = base.extend<{ connectedSession: ConnectedSession; orcid: Orcid }>({
  connectedSession: async ({ page }, use) => {
    const connectedSession = new ConnectedSession(page, TEST_ADDRESSES[0]);
    await connectedSession.goto();
    await connectedSession.connect();

    await use(connectedSession);
  },
  orcid: async ({ connectedSession }, use) => {
    await use(new Orcid(connectedSession, orcidClaimManager));
  },
});

test('claim ORCID flow', async ({ orcid }) => {
  test.setTimeout(120_000);

  await orcid.claim();
});
