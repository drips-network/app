import getConnectedAddress from '$lib/utils/get-connected-address';
import isSafePath from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
  const backTo = url.searchParams.get('backTo');

  const connectedAddress = getConnectedAddress();

  if (connectedAddress) {
    if (backTo) {
      const decoded = decodeURIComponent(backTo);
      const isSafe = isSafePath(decoded);

      if (isSafe) throw redirect(301, decoded);
    } else {
      throw redirect(301, '/app');
    }
  }
};

export const ssr = false;
