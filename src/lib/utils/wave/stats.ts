import { authenticatedCall } from './call';
import { contributorStatsResponseSchema, contributorAiSummaryResponseSchema } from './types/stats';
import parseRes from './utils/parse-res';

export async function getContributorStats(f = fetch) {
  return parseRes(
    contributorStatsResponseSchema,
    await authenticatedCall(f, '/api/stats/contributor'),
  );
}

export async function getContributorAiSummary(f = fetch) {
  return parseRes(
    contributorAiSummaryResponseSchema,
    await authenticatedCall(f, '/api/stats/contributor/ai-summary'),
  );
}
