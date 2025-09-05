import { getApplications, getBallotStats, getOwnBallot, getRound } from '$lib/utils/rpgf/rpgf.js';
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

  // Max 5 applications for the preview
  const applications = await getApplications(
    fetch,
    round.id,
    5,
    0,
    round.resultsPublished ? 'allocation:desc' : 'createdAt:desc',
  );

  const existingBallot = round.isVoter ? await getOwnBallot(fetch, round.id) : null;

  let ballotStats: Awaited<ReturnType<typeof getBallotStats>> | null = null;

  if (round.isAdmin) {
    ballotStats = await getBallotStats(fetch, round.id);
  }

  return {
    round,
    applications,
    existingBallot,
    ballotStats,
  };
};
