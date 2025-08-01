import buildUrl from '$lib/utils/build-url';
import { getApplications, getBallotStats, getOwnBallot, getRound } from '$lib/utils/rpgf/rpgf.js';
import { error, redirect } from '@sveltejs/kit';

export const ssr = false;

export const load = async ({ fetch, params, parent, url }) => {
  const { rpgfUserData } = await parent();

  if (!rpgfUserData) {
    // User is not signed in, so redirect to connect
    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }

  const { slug } = params;

  const wrappedRound = await getRound(fetch, slug);

  // Todo(RPGF): Parallelize fetches below

  if (!wrappedRound) {
    return error(404);
  }

  // Max 5 applications for the preview
  const applications = await getApplications(
    fetch,
    wrappedRound.round.urlSlug,
    wrappedRound.round.applicationFormat,
    5,
    0,
    wrappedRound.round.resultsPublished ? 'allocation:desc' : 'createdAt:desc',
  );

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
