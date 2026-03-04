import { getOrgMembers, getPublicOrg } from '$lib/utils/wave/orgs.js';
import { getWavePrograms, getWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';
import { getAllPaginated } from '$lib/utils/wave/getAllPaginated.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
  const { orgId } = params;

  const [org, members, wavePrograms] = await Promise.all([
    getPublicOrg(fetch, orgId),
    getOrgMembers(fetch, orgId),
    getAllPaginated((page, limit) => getWavePrograms(fetch, { page, limit })),
  ]);

  if (!org) {
    throw error(404, 'Organization not found');
  }

  const initialRepos =
    wavePrograms.length > 0
      ? await getWaveProgramRepos(fetch, wavePrograms[0].id, { limit: 7 }, { orgId })
      : undefined;

  return { org, members, wavePrograms, initialRepos };
};
