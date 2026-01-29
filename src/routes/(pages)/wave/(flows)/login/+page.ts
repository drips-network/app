import { safeParseBackToParam } from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
  const { user } = await parent();

  const backTo = safeParseBackToParam(url);

  if (backTo && user) {
    redirect(301, backTo);
  } else if (user) {
    redirect(301, '/wave');
  }

  const skipWelcome = url.searchParams.get('skipWelcome') === 'true';

  return {
    backTo,
    skipWelcome,
  };
};
