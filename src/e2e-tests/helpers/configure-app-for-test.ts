import type { Page } from 'playwright';

export default (page: Page) =>
  page.addInitScript(`
    window.isPlaywrightTest = true;
    window.playwrightAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

    localStorage.setItem('custom-tokens', JSON.stringify([
      {
        "source": "custom",
        "banned": false,
        "info": {
          "chainId": 5,
          "address": "0x9A676e781A523b5d0C0e43731313A708CB607508",
          "name": "Testcoin",
          "decimals": 18,
          "symbol": "TEST"
        }
      }
    ]));
`);
