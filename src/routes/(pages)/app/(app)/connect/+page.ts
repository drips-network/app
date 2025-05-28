import getConnectedAddress from '$lib/utils/get-connected-address';
import { rpgfJwtStore } from '$lib/utils/rpgf/siwe.js';
import isSafePath from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export const load = async ({ url }) => {
  const backTo = url.searchParams.get('backTo');
  const requireRpgfSignIn = url.searchParams.get('requireRpgfSignIn') === 'true';

  const connectedAddress = getConnectedAddress();

  if (connectedAddress && (!requireRpgfSignIn || (requireRpgfSignIn && get(rpgfJwtStore)))) {
    if (backTo) {
      const decoded = decodeURIComponent(backTo);
      const isSafe = isSafePath(decoded);

      if (isSafe) redirect(301, decoded);
    } else {
      redirect(301, '/app');
    }
  }

  return {
    requireRpgfSignIn,
  };
};

export const ssr = false;
