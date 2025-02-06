import { browser } from '$app/environment';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';

export default function getConnectedAddress() {
  if (!browser) throw new Error('This function only works client-side.');

  return get(walletStore).address;
}
