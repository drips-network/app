import getConnectedAddress from '$lib/utils/get-connected-address';
import { rpgfAccessJwtStore } from '$lib/utils/rpgf/siwe.js';
import isSafePath from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export const load = async ({ url }) => {
  // `searchParams.get` already decodes the value.
  const backTo = url.searchParams.get('backTo') ?? '';
  const requireRpgfSignIn = url.searchParams.get('requireRpgfSignIn') === 'true';

  const connectedAddress = getConnectedAddress();

  if (connectedAddress && (!requireRpgfSignIn || (requireRpgfSignIn && get(rpgfAccessJwtStore)))) {
    if (backTo) {
      if (isSafePath(backTo)) redirect(301, backTo);
    } else {
      redirect(301, '/app');
    }
  }

  return {
    requireRpgfSignIn,
    backTo: isSafePath(backTo) ? backTo : '',
  };
};

export const ssr = false;
