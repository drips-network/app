import { error } from '@sveltejs/kit';

export const ssr = false;

export const load = async ({ parent }) => {
  const { round } = await parent();

  // settings page is only available for logged-in admins.
  if (!round.isAdmin) {
    return error(401);
  }
};
