import { getWaveProgramOrgs } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ parent, fetch, url }) => {
  const { waveProgram } = await parent();

  const search = url.searchParams.get('search') || undefined;

  const orgs = await getWaveProgramOrgs(
    fetch,
    waveProgram.id,
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
