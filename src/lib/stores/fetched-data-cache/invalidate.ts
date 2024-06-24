import { invalidateAll as skInvalidateAll, invalidate as skInvalidate } from '$app/navigation';
import { clear, clearAll } from './fetched-data-cache.store';

/**
 * Invalidate `key` in the local fetched data cache and re-run all load functions
 * that depend on `key`.
 */
export async function invalidate(key: string) {
  clear(key);
  await skInvalidate(key);
}

/**
 * Invalidate all keys in the local fetched data cache and re-run all currently active load functions.
 */
export async function invalidateAll() {
  clearAll();
  await skInvalidateAll();
}
