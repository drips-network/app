import wallet from '$lib/stores/wallet/wallet.store';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';

export default async function (senderAccountIds: string[], tokenAddress: string) {
  const subgraphClient = getSubgraphClient();

  const { dripsAccountId: ownAccountId } = get(wallet);
  assert(ownAccountId);

  return await Promise.all(
    senderAccountIds.map((senderAccountId) =>
      subgraphClient.getArgsForSqueezingAllDrips(ownAccountId, senderAccountId, tokenAddress),
    ),
  );
}
