import { getLivenessCheckpointStatus } from '$lib/utils/wave/liveness.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  depends('wave:liveness-checkpoint');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const checkpoint = await getLivenessCheckpointStatus(fetch, 'grant_access');

  return {
    checkpoint,
  };
};
