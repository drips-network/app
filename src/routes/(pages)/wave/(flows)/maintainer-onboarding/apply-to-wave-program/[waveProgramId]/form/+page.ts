import { getOwnRepos } from '$lib/utils/wave/orgs';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated';

export const load = async ({ fetch }) => {
  const ownRepos = await getAllPaginated((page, limit) => getOwnRepos(fetch, { page, limit }));

  return {
    ownRepos,
  };
};
