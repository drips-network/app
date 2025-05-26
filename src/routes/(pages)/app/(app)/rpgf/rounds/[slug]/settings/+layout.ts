import { error } from '@sveltejs/kit';
import type { WrappedRoundAdmin } from '$lib/utils/rpgf/schemas';

export const ssr = false;

export const load = async ({ parent }) => {
  const { wrappedRound } = await parent();

  // settings page is only available for logged-in admins.
  if (!wrappedRound.round.isAdmin) {
    return error(401);
  }

  return {
    wrappedRound: wrappedRound as WrappedRoundAdmin,
  };
};
