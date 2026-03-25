import { getApplicationQuotaDetails } from '$lib/utils/wave/issues';
import { getWavePrograms } from '$lib/utils/wave/wavePrograms';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const wavePrograms = await getWavePrograms(fetch, { limit: 100 });

  const selectedWaveProgramId = url.searchParams.get('waveProgramId') ?? wavePrograms.data[0]?.id;

  const quotaDetails = selectedWaveProgramId
    ? await getApplicationQuotaDetails(fetch, selectedWaveProgramId)
    : undefined;

  return {
    user,
    wavePrograms: wavePrograms.data,
    selectedWaveProgramId,
    quotaDetails,
  };
};
