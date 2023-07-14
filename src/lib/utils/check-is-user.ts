import wallet from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';

/**
 * Check if the currently logged-in user's AddressDriver dripsAccountId matches
 * a particular dripsAccountId.
 * @param dripsAccountId The dripsAccountId to match against.
 * @returns True if matches, false otherwise.
 */
export default function (dripsAccountId: string): boolean {
  const { dripsAccountId: currentDripsAccountId } = get(wallet);

  return dripsAccountId === currentDripsAccountId;
}
