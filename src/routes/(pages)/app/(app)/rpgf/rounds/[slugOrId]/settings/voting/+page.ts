import { getRoundVoters } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ parent, fetch, depends }) => {
  depends('rpgf:round-voters');

  const { round } = await parent();

  const roundVoters = await getRoundVoters(fetch, round.id);

  return {
    roundVoters,
  };
};
