import getConnectedAddress from '$lib/utils/get-connected-address';
import { rpgfAccessJwtStore } from '$lib/utils/rpgf/siwe.js';
import isSafePath from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export const load = async ({ url }) => {
  const backTo = url.searchParams.get('backTo');
  const requireRpgfSignIn = url.searchParams.get('requireRpgfSignIn') === 'true';
  const decoded = decodeURIComponent(backTo || '');

  const connectedAddress = getConnectedAddress();

  if (connectedAddress && (!requireRpgfSignIn || (requireRpgfSignIn && get(rpgfAccessJwtStore)))) {
    if (backTo) {
      const isSafe = isSafePath(decoded);

      if (isSafe) redirect(301, decoded);
    } else {
      redirect(301, '/app');
    }
  }

  return {
    requireRpgfSignIn,
    backTo: decoded,
  };
};

export const ssr = false;
