import { getCustomDatasetsForRound } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ parent, fetch, depends }) => {
  depends('rpgf:round:applications:custom-datasets');

  const { round } = await parent();

  const customDatasets = await getCustomDatasetsForRound(fetch, round.id);

  return {
    customDatasets,
  };
};
