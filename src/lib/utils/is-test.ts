import { browser } from '$app/environment';

export default function isTest(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return browser && (window as any).isPlaywrightTest;
}
