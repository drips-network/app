import { redirect } from '@sveltejs/kit';
import network from '$lib/stores/wallet/network.js';

export const prerender = true;

export async function load({ route }) {
  // TODO: Remove when we go full multi-chain.
  if (network.alternativeChainMode) {
    // Serve from the `mainnet` instance
    return redirect(308, `https://drips.network${route.id}`);
  }
}
