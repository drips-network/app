import { getDripsClient } from '$lib/utils/get-drips-clients';
import mapFilterUndefined from '../map-filter-undefined';

interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export default async function fetchBalancesForTokens(
  balance: 'splittable' | 'receivable' | 'collectable',
  tokens: Set<string>,
  accountId: string,
): Promise<Amount[]> {
  const client = await getDripsClient();

  let promises: Promise<Amount | undefined>[];
  switch (balance) {
    case 'splittable': {
      promises = Array.from(tokens).map(async (ta) => {
        const balance = await client.getSplittableBalanceForUser(accountId, ta);

        if (balance.splittableAmount === 0n) return undefined;

        return {
          amount: balance.splittableAmount,
          tokenAddress: balance.tokenAddress,
        };
      });
      break;
    }
    case 'receivable': {
      promises = Array.from(tokens).map(async (ta) => {
        const balance = await client.getReceivableBalanceForUser(accountId, ta, 1000);
        if (balance.receivableAmount === 0n) return undefined;

        return {
          amount: balance.receivableAmount,
          tokenAddress: balance.tokenAddress,
        };
      });
      break;
    }
    case 'collectable': {
      promises = Array.from(tokens).map(async (ta) => {
        const balance = await client.getCollectableBalanceForUser(accountId, ta);
        if (balance.collectableAmount === 0n) return undefined;

        return {
          amount: balance.collectableAmount,
          tokenAddress: balance.tokenAddress,
        };
      });
      break;
    }
  }

  return mapFilterUndefined(await Promise.all(promises), (v) => v);
}
