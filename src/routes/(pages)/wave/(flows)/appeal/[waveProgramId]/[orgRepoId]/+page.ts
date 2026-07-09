import { getRepoAppealEligibility } from '$lib/utils/wave/wavePrograms';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params }) => {
  const context = await getRepoAppealEligibility(fetch, params.waveProgramId, params.orgRepoId);

  if (!context) {
    throw error(404, 'Repo application not found');
  }

  return { context };
};
