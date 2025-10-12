import { getBallotStats, getOwnBallot, getRound } from '$lib/utils/rpgf/rpgf.js';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ fetch, params, url, depends }) => {
  depends('rpgf:round');

  const { slugOrId } = params;

  const round = await getRound(fetch, slugOrId);
  if (!round) {
    return error(404);
  }

  // If round is published and user navigated to its ID, redirect to the slug URL, WHILE PRESERVING THE PATH AND PARAMS
  if (round.published && round.urlSlug && round.urlSlug !== slugOrId) {
    const newUrl = url.pathname.replace(slugOrId, round.urlSlug);
    throw redirect(307, newUrl);
  }

  // If round is not published and user navigated to its slug, redirect to the ID URL, WHILE PRESERVING THE PATH AND PARAMS
  if (!round.published && round.urlSlug && round.urlSlug === slugOrId) {
    const newUrl = url.pathname.replace(slugOrId, round.id);
    throw redirect(307, newUrl);
  }

  const [existingBallot, ballotStats] = await Promise.all([
    round.isVoter ? getOwnBallot(fetch, round.id) : null,
    round.isAdmin ? getBallotStats(fetch, round.id) : null,
  ]);

  return {
    round,
    existingBallot,
    ballotStats,
  };
};
