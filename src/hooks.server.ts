import { PuppeteerManager } from '$lib/utils/puppeteer';

PuppeteerManager.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
