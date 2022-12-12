import type { Page } from 'playwright';

export default async (page: Page, number: number) => {
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${number}.png` });
};
