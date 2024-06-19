import { browser } from '$app/environment';
import getCookieClientSide from './get-cookie-clientside';
import isTest from './is-test';

export default function getConnectedAddress() {
  if (!browser) throw new Error('This function only works client-side.');

  return isTest()
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).playwrightAddress ?? '0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc'
    : getCookieClientSide('connected-address');
}
