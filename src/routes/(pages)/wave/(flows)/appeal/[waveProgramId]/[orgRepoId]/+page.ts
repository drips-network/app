import { getRepoAppealEligibility } from '$lib/utils/wave/wavePrograms';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ fetch, params, parent, url }) => {
  const { user } = await parent();

  // Not logged in: bounce through login and return to this flow afterwards.
  if (!user) {
    throw redirect(
      302,
      `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}&skipWelcome=true`,
    );
  }

  const context = await getRepoAppealEligibility(fetch, params.waveProgramId, params.orgRepoId);

  if (!context) {
    throw error(404, 'Repo application not found');
  }

  return { context };
};
