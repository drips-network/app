import type { Page } from 'playwright';

export default (page: Page, newAddress: string, newDripsUserId?: string) =>
  page.addInitScript(`
    window.playwrightAddress = '${newAddress}';
    ${newDripsUserId ? `window.playwrightDripsUserId = "${newDripsUserId}";` : ''}
  `);
