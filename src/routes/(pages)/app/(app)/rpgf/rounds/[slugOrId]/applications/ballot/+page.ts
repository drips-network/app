import buildUrl from '$lib/utils/build-url.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { rpgfUserData, round } = await parent();

  if (!rpgfUserData) {
    return redirect(
      307,
      buildUrl('/app/connect', { requireRpgfSignIn: 'true', backTo: url.pathname }),
    );
  }

  if (!round.isVoter) {
    return error(401, 'You are not a voter in this round');
  }

  return {};
};
