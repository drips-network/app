import { CODE_METRICS } from '$lib/utils/wave/types/user';

export const KEY_METRICS = CODE_METRICS.filter((m) =>
  ['oss_composite', 'total_merged_prs', 'pr_merge_rate'].includes(m.key),
).sort((a, b) => {
  // oss_composite first
  if (a.key === 'oss_composite') return -1;
  if (b.key === 'oss_composite') return 1;

  return 0;
});
export const TABLE_METRICS = CODE_METRICS.filter((m) => !KEY_METRICS.includes(m));
