import { getApplicationCategories } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ parent, fetch }) => {
  const { round } = await parent();

  const categories = await getApplicationCategories(fetch, round.id);

  return {
    categories,
  };
};
