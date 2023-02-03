import wallet from '$lib/stores/wallet/wallet.store';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';

export default async function (senderUserIds: string[], tokenAddress: string) {
  const subgraphClient = getSubgraphClient();

  const { dripsUserId: ownUserId } = get(wallet);
  assert(ownUserId);

  return await Promise.all(
    senderUserIds.map((senderUserId) =>
      subgraphClient.getArgsForSqueezingAllDrips(ownUserId, senderUserId, tokenAddress),
    ),
  );
}
