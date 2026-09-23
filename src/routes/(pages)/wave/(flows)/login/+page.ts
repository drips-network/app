import { safeParseBackToParam } from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
  const { user } = await parent();

  const backTo = safeParseBackToParam(url);

  // Temporary redirect on purpose: a 301 is cached by the browser, so a
  // logged-in user who once hit this page would keep being bounced to the
  // same target even after logging out, and it tightens the loop when the
  // client and server disagree about the session.
  if (backTo && user) {
    redirect(302, backTo);
  } else if (user) {
    redirect(302, '/wave');
  }

  const skipWelcome = url.searchParams.get('skipWelcome') === 'true';

  return {
    backTo,
    skipWelcome,
  };
};
