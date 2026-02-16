import { getPublicOrgs } from '$lib/utils/wave/orgs.js';

export const load = async ({ fetch, url }) => {
  const search = url.searchParams.get('search') || undefined;

  const orgs = await getPublicOrgs(
    fetch,
    {
      limit: 20,
    },
    { search },
  );

  return {
    orgs,
    search,
  };
};
