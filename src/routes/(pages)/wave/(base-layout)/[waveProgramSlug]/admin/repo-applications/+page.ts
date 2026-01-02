import { getPendingWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:admin:repo-applications');

  const { waveProgram } = await parent();

  try {
    const pendingRepoApplications = await getPendingWaveProgramRepos(fetch, waveProgram.id, {
      limit: 100,
    });

    return {
      pendingRepoApplications,
      isWaveAdmin: true,
    };
  } catch (_e) {
    // Most likely a 403 from the API if the current user isn't an admin of this wave program.
    // We keep the page functional and let the UI show a friendly message.
    return {
      pendingRepoApplications: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isWaveAdmin: false,
    };
  }
};
