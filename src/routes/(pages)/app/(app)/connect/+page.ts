import getConnectedAddress from '$lib/utils/get-connected-address';
import isSafePath from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
  const backTo = url.searchParams.get('backTo');
  const decoded = decodeURIComponent(backTo || '');

  const connectedAddress = getConnectedAddress();

  if (connectedAddress) {
    if (backTo) {
      const isSafe = isSafePath(decoded);

      if (isSafe) redirect(301, decoded);
    } else {
      redirect(301, '/app');
    }
  }

  return {
    backTo: decoded,
  };
};

export const ssr = false;
