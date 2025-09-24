import { getApplications } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';

export const load = async ({ parent, url, depends, fetch }) => {
  depends('rpgf:round:applications');

  const { round, rpgfUserData } = await parent();

  if (!round.published) {
    throw error(404);
  }

  const { resultsPublished } = round;

  const sortByParam: string =
    url.searchParams.get('sortBy') ?? (resultsPublished ? 'allocation' : 'createdAt');
  const filterParam: string | null = url.searchParams.get('filter');

  const allApplications =
    filterParam === 'own' && !rpgfUserData
      ? []
      : await getApplications(
          fetch,
          round.id,
          100000, // Fetch all applications, later we can paginate
          0,
          (() => {
            switch (sortByParam) {
              case 'createdAt':
                return 'createdAt:desc';
              case 'name':
                return 'name:asc';
              case 'allocation':
                return 'allocation:desc';
              default:
                return undefined;
            }
          })(),
          filterParam === 'own' && rpgfUserData ? rpgfUserData.userId : null,
          filterParam === 'approved' || filterParam === 'rejected' || filterParam === 'pending'
            ? filterParam
            : undefined,
          filterParam?.startsWith('cat-') ? filterParam.replaceAll('cat-', '') : undefined,
        );

  return {
    allApplications,
    sortByParam,
    filterParam,
  };
};

export const ssr = false;
