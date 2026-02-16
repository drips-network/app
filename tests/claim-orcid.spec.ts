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

/**
 * This test relies on the profile at https://sandbox.orcid.org/0009-0003-3033-0123
 * having its DRIPS_OWNERSHIP_CLAIM set to
 * http://0.0.0.0/DRIPS_OWNERSHIP_CLAIM?localtestnet=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
 * (i.e. pointing to the local dev wallet address).
 */
test('claim ORCID flow', async ({ orcid }) => {
  test.setTimeout(120_000);

  await orcid.claim();
});
