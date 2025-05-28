import { getApplications, getRound } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';

export const ssr = false;

export const load = async ({ fetch, params, parent }) => {
  const { rpgfUserData } = await parent();

  const { slug } = params;

  const wrappedRound = await getRound(fetch, slug);

  if (!wrappedRound) {
    return error(404);
  }

  const applications = await getApplications(
    fetch,
    wrappedRound.round.urlSlug,
    wrappedRound.round.applicationFormat,
  );

  const isRoundAdmin = rpgfUserData?.walletAddress
    ? wrappedRound.round.adminWalletAddresses.includes(rpgfUserData?.walletAddress)
    : false;

  return {
    wrappedRound,
    applications,
    isRoundAdmin,
  };
};
