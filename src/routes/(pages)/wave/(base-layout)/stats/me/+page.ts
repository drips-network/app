import { getContributorStats, getContributorAiSummary } from '$lib/utils/wave/stats.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  depends('wave:stats');

  const [stats, aiSummary] = await Promise.all([
    getContributorStats(fetch),
    getContributorAiSummary(fetch),
  ]);

  return {
    user,
    stats,
    aiSummary,
  };
};
