import { getApplications, getBallotStats, getOwnBallot, getRound } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';

export const ssr = false;

export const load = async ({ fetch, params, parent }) => {
  const { rpgfUserData } = await parent();

  const { slug } = params;

  const wrappedRound = await getRound(fetch, slug);

  // Todo(RPGF): Parallelize fetches below

  if (!wrappedRound) {
    return error(404);
  }

  const applications = (
    await getApplications(fetch, wrappedRound.round.urlSlug, wrappedRound.round.applicationFormat)
  ).sort((a, b) => {
    // Sort applications by creation date, newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const isRoundAdmin = rpgfUserData?.walletAddress
    ? wrappedRound.round.adminWalletAddresses.includes(rpgfUserData?.walletAddress)
    : false;

  const isRoundVoter = wrappedRound.isVoter;

  const existingBallot = isRoundVoter
    ? await getOwnBallot(fetch, wrappedRound.round.urlSlug)
    : null;

  let ballotStats: Awaited<ReturnType<typeof getBallotStats>> | null = null;

  if (isRoundAdmin) {
    ballotStats = await getBallotStats(fetch, wrappedRound.round.urlSlug);
  }

  return {
    wrappedRound,
    applications,
    isRoundAdmin,
    isRoundVoter,
    existingBallot,
    ballotStats,
  };
};
