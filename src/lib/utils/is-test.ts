import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

export default function isTest(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return browser && env?.PUBLIC_TEST_MODE === 'true';
}
