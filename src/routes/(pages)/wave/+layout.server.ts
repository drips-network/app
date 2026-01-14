import network from '$lib/stores/wallet/network';
import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  if (network.alternativeChainMode) {
    // Wave app only served by mainnet deployment
    throw error(404);
  }

  return {
    waveAccessToken: locals.waveAccessToken ?? null,
  };
};
