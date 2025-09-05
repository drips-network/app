import { getApplicationCategories, getApplicationForms } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ parent, fetch, depends }) => {
  depends('rpgf:round:applications:categories-and-forms');

  const { round } = await parent();

  const applicationCategories = await getApplicationCategories(fetch, round.id);
  const applicationForms = await getApplicationForms(fetch, round.id);

  return {
    applicationCategories,
    applicationForms,
  };
};
