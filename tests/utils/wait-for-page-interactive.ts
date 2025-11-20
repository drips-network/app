import type { Page } from '@playwright/test';

/**
 * Waits for the page to be fully interactive by ensuring the loading overlay
 * is removed. This is critical in headed mode where navigation is slower and
 * the loading state (which applies pointer-events: none) can block interactions.
 */
export async function waitForPageInteractive(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const content = document.querySelector('.page-content-inner');
    return content && !content.classList.contains('loading');
  });
}
