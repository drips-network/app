import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { redirect } from '@sveltejs/kit';
import ens from '$lib/stores/ens';
import { get } from 'svelte/store';

export const load = async () => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    throw redirect(307, buildUrl('/app/connect', { backTo: '/app/profile' }));
  }

  const $ens = get(ens);
  const redirectUrl = `/app/${$ens[connectedAddress]?.name ?? connectedAddress}`;

  redirect(301, redirectUrl);
};

export const ssr = false;
