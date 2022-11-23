import wallet from '$lib/stores/wallet';
import { get } from 'svelte/store';

/**
 * Check if the currently logged-in user's AddressDriver dripsUserId matches
 * a particular dripsUserId.
 * @param dripsUserId The dripsUserId to match against.
 * @returns True if matches, false otherwise.
 */
export default function (dripsUserId: string): boolean {
  const { dripsUserId: currentDripsUserId } = get(wallet);

  return dripsUserId === currentDripsUserId;
}
