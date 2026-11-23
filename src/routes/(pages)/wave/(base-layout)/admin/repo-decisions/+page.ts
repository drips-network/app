import { getWavePrograms } from '$lib/utils/wave/wavePrograms.js';

// No permission check here: the admin layout already requires an admin user, and the API decides
// per program (program admins review their own programs; `reviewWaveProgramRepos` covers all).
export const load = async ({ fetch }) => {
  const wavePrograms = await getWavePrograms(fetch, { limit: 100 });

  return { wavePrograms };
};
