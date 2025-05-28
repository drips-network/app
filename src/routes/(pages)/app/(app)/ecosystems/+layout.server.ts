import network from '$lib/stores/wallet/network';
import { error } from '@sveltejs/kit';

export const load = async () => {
  // allow ecosystems routes only for enabled networks
  if (!network.ecosystems) {
    return error(404);
  }

  return {};
};
