import fetchRelevantTokens from '$lib/utils/drips/relevant-tokens';
import fetchBalancesForTokens from '$lib/utils/drips/fetch-balances-for-tokens';

export default async function fetchUnclaimedFunds(projectAccountId: string) {
  const relevantTokens = await fetchRelevantTokens('collectable', projectAccountId);

  const balances = await Promise.all([
    fetchBalancesForTokens('splittable', relevantTokens, projectAccountId),
    fetchBalancesForTokens('collectable', relevantTokens, projectAccountId),
  ] as const);

  return {
    splittable: balances[0],
    collectable: balances[1],
  }
}
