import type { Page } from '@playwright/test';

/** These addresses all start with 10000 ETH on the local testnet. Address 0 also has 100000 TEST. */
export const TEST_ADDRESSES = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
];

export class ConnectedSession {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:5173/app');
  }

  async connect(address = TEST_ADDRESSES[0]) {
    // insert hidden `span` with id E2E_ADDRESS into the DOM in order to tell
    // the local testnet wallet store which address to use
    await this.page.evaluate((addr) => {
      const span = document.createElement('span');
      span.style.display = 'none';
      span.id = 'E2E_ADDRESS';
      span.textContent = addr;
      document.body.appendChild(span);
    }, address);

    await this.page.getByRole('button', { name: 'Connect', exact: true }).click();
  }

  async disconnect() {
    await this.page.locator('.identity-badge').first().click();
    await this.page.getByRole('button', { name: 'Disconnect' }).click();
  }
}
