import isSafePath from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
  const { user } = await parent();

  const backTo = url.searchParams.get('backTo');
  const decodedBackTo = decodeURIComponent(backTo || '');

  if (backTo && user) {
    const isSafe = isSafePath(decodedBackTo);

    if (isSafe) redirect(301, decodedBackTo);
  } else if (user) {
    redirect(301, '/wave');
  }

  const skipWelcome = url.searchParams.get('skipWelcome') === 'true';

  return {
    backTo: decodedBackTo,
    skipWelcome,
  };
};
