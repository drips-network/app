import { getOwnRepos } from '$lib/utils/wave/orgs';

export const load = async ({ fetch }) => {
  const ownRepos = await getOwnRepos(fetch, { limit: 100 });

  return {
    ownRepos,
  };
};
