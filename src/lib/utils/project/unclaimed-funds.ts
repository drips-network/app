import fetchRelevantTokens from '$lib/utils/drips/relevant-tokens';
import fetchBalancesForTokens from '$lib/utils/drips/fetch-balances-for-tokens';

export default async function fetchUnclaimedFunds(projectAccountId: string) {
  const relevantTokens = await fetchRelevantTokens('splittable', projectAccountId);

  return (await fetchBalancesForTokens('splittable', relevantTokens, projectAccountId)).map(
    (a) => ({
      tokenAddress: a.tokenAddress,
      amount: a.splittableAmount,
    }),
  );
}
