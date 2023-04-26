import type { Page } from 'playwright';

export default (page: Page) =>
  page.addInitScript(`
    window.playwrightAddress = '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc';
`);
