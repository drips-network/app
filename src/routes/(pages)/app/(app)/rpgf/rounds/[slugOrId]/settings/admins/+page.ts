import { getRoundAdmins } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ parent, fetch }) => {
  const { round } = await parent();

  const roundAdmins = await getRoundAdmins(fetch, round.id);

  return {
    roundAdmins,
  };
};
