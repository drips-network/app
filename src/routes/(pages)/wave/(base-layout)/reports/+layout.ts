import { getWavePrograms, getWaves } from '$lib/utils/wave/wavePrograms';
import { getOrgWaveReports, getWaveReport } from '$lib/utils/wave/waveReports';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const wavePrograms = await getWavePrograms(fetch, { limit: 100 });

  const selectedWaveProgramId = url.searchParams.get('waveProgramId') ?? wavePrograms.data[0]?.id;

  const waves = selectedWaveProgramId
    ? (await getWaves(fetch, selectedWaveProgramId, { limit: 100 })).data.toSorted(
        (a, b) => b.waveNumber - a.waveNumber,
      )
    : [];

  // Default to the latest wave that has already started — reports only exist
  // for waves whose review period has ended, so upcoming waves are a bad default.
  const defaultWaveId = (waves.find((w) => w.status !== 'upcoming') ?? waves[0])?.id;
  const requestedWaveId = url.searchParams.get('waveId');
  const selectedWaveId = waves.some((w) => w.id === requestedWaveId)
    ? requestedWaveId
    : defaultWaveId;

  const [report, orgReports] = selectedWaveId
    ? await Promise.all([
        getWaveReport(fetch, selectedWaveId),
        getOrgWaveReports(fetch, selectedWaveId),
      ])
    : [null, { reports: [] }];

  const requestedOrgId = url.searchParams.get('orgId');
  const defaultOrgEntry =
    orgReports.reports.find((entry) => entry.report !== null) ?? orgReports.reports[0];
  const selectedOrgId = orgReports.reports.some((entry) => entry.org.id === requestedOrgId)
    ? requestedOrgId
    : (defaultOrgEntry?.org.id ?? null);

  return {
    user,
    wavePrograms: wavePrograms.data,
    selectedWaveProgramId,
    waves,
    selectedWaveId,
    report,
    orgReports: orgReports.reports,
    selectedOrgId,
  };
};
