import network from '$lib/stores/wallet/network';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
  // allow ecosystems routes only for enabled
  // networks
  if (!network.ecosystems) {
    return redirect(307, '/app');
  }

  return {};
};
