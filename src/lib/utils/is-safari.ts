import { browser } from '$app/environment';

export default function isSafari() {
  if (!browser) return false;

  return Boolean(
    navigator.vendor &&
      navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1,
  );
}
