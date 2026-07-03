import { authenticatedCall } from './call';
import parseRes from './utils/parse-res';
import {
  orgWaveReportsResponseSchema,
  waveReportDtoSchema,
  waveReportsResponseSchema,
} from './types/waveReport';

/** Lists the authenticated user's wave performance reports. */
export async function getWaveReports(f = fetch) {
  return parseRes(waveReportsResponseSchema, await authenticatedCall(f, '/api/user/wave-reports'));
}

/**
 * Gets the authenticated user's performance report for a single wave.
 * Returns null when no report exists (user didn't participate, or the wave's
 * reports haven't been generated yet).
 */
export async function getWaveReport(f = fetch, waveId: string) {
  return parseRes(
    waveReportDtoSchema,
    await authenticatedCall(f, `/api/user/wave-reports/${waveId}`),
    { expect404: true },
  );
}

/**
 * Gets, for every org the authenticated user is a member of, that org's
 * performance report for the given wave (null when none exists).
 */
export async function getOrgWaveReports(f = fetch, waveId: string) {
  return parseRes(
    orgWaveReportsResponseSchema,
    await authenticatedCall(f, `/api/user/org-wave-reports/${waveId}`),
  );
}
