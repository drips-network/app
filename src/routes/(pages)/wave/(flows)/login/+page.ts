import isSafePath from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
  const { user } = await parent();

  const backTo = url.searchParams.get('backTo');
  const decoded = decodeURIComponent(backTo || '');

  if (backTo && user) {
    const isSafe = isSafePath(decoded);

    if (isSafe) redirect(301, decoded);
  } else if (user) {
    redirect(301, '/wave');
  }

  return {
    backTo: decoded,
  };
};
