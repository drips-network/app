import type { Page } from 'playwright';

export default (page: Page) =>
  page.addInitScript(`
    window.isPlaywrightTest = true;
    window.playwrightAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
`);
