import buildUrl from '$lib/utils/build-url';
import { getBallots, getRoundVoters } from '$lib/utils/rpgf/rpgf.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  depends('rpgf:round:ballots');

  const { rpgfUserData, round } = await parent();

  if (!rpgfUserData) {
    redirect(307, buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }));
  }

  const ballots = await getBallots(fetch, round.id);
  const voters = await getRoundVoters(fetch, round.id);

  return { ballots, voters };
};

export const ssr = false;
