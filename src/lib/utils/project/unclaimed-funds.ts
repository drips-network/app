import fetchRelevantTokens from '$lib/utils/drips/relevant-tokens';
import fetchBalancesForTokens from '$lib/utils/drips/fetch-balances-for-tokens';

export default async function fetchUnclaimedFunds(projectUserId: string) {
  const relevantTokens = await fetchRelevantTokens('splittable', projectUserId);

  return (await fetchBalancesForTokens('splittable', relevantTokens, projectUserId)).map((a) => ({
    tokenAddress: a.tokenAddress,
    amount: a.splittableAmount,
  }));
}
