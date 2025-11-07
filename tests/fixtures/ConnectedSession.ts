import type { Page } from '@playwright/test';

/** These addresses all start with 10000 ETH on the local testnet */
export const TEST_ADDRESSES = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // owns efstajas/drips-test-repo-1, 100000 TEST
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // owns efstajas/drips-test-repo-2
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // owns efstajas/drips-test-repo-3
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // owns efstajas/drips-test-repo-4
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // owns efstajas/drips-test-repo-5
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', // owns efstajas/drips-test-repo-6
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
];

export class ConnectedSession {
  constructor(
    public readonly page: Page,
    public readonly address: string,
  ) {}

  async goto() {
    await this.page.goto('http://localhost:5173/app');
    await this.page.waitForTimeout(1000); // Reduce flakiness of first nav, for some reason
  }

  async connect() {
    // Wait for page to be fully loaded and network to be idle to avoid race conditions
    await this.page.waitForLoadState('networkidle');

    // Wait for the Connect button to be visible - this ensures the page has fully
    // hydrated and is stable before we inject JavaScript
    await this.page
      .getByRole('button', { name: 'Connect', exact: true })
      .waitFor({ state: 'visible' });

    // insert hidden `span` with id E2E_ADDRESS into the DOM in order to tell
    // the local testnet wallet store which address to use
    // Retry mechanism to handle potential navigation timing issues
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        await this.page.evaluate((addr) => {
          const span = document.createElement('span');
          span.style.display = 'none';
          span.id = 'E2E_ADDRESS';
          span.textContent = addr;
          document.body.appendChild(span);
        }, this.address);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('Execution context was destroyed') && retries > 1) {
          // Wait for navigation to complete and retry
          await this.page.waitForLoadState('networkidle');
          await this.page
            .getByRole('button', { name: 'Connect', exact: true })
            .waitFor({ state: 'visible' });
          retries--;
          continue;
        }
        // If it's a different error or last retry, throw
        throw error;
      }
    }

    if (retries === 0 && lastError) {
      throw lastError;
    }

    await this.page.getByRole('button', { name: 'Connect', exact: true }).click();

    // wait for first 4 and last 4 characters of address to be visible
    const addressLocator = this.page
      .getByText(this.address.slice(0, 4) + '–' + this.address.slice(-4), { exact: true })
      .nth(0);
    await addressLocator.waitFor({ state: 'visible' });
  }

  async disconnect() {
    // Currently, connected state is not persisted in local env, so we can just reload the
    // page to "disconnect"
    await this.page.reload();
  }
}
