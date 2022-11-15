import type { Page } from 'playwright';

export default (page: Page, newAddress: string) =>
  page.addInitScript(`
    window.playwrightAddress = '${newAddress}';
  `);
