import network from '$lib/stores/wallet/network';
import { error } from '@sveltejs/kit';

export const load = async () => {
  // Only allow ORCID claiming on networks where the feature is enabled
  if (!network.orcids) {
    return error(404);
  }

  return {};
};
