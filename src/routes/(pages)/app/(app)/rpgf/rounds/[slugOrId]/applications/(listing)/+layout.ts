import { error } from '@sveltejs/kit';

export const load = async ({ parent, depends }) => {
  depends('rpgf:round:applications');

  const { round } = await parent();

  if (!round.published) {
    throw error(404);
  }

  return {};
};

export const ssr = false;
