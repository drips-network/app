import { toBigInt } from 'ethers';
import mapFilterUndefined from '../map-filter-undefined';
import { executeDripsReadMethod } from '../sdk/drips/drips';
import type { OxString } from '../sdk/sdk-types';
import { single } from '../sdk/utils/single';

interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export default async function fetchBalancesForTokens(
  balance: 'splittable' | 'receivable' | 'collectable',
  tokens: Set<string>,
  accountId: string,
): Promise<Amount[]> {
  let promises: Promise<Amount | undefined>[];
  switch (balance) {
    case 'splittable': {
      promises = Array.from(tokens).map(async (ta) => {
        const balance = await getSplittableBalanceForUser(accountId, ta);

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
        const balance = await getReceivableBalanceForUser(accountId, ta, 1000);
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
        const balance = await getCollectableBalanceForUser(accountId, ta);
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
async function getSplittableBalanceForUser(accountId: string, ta: string) {
  return single(
    (
      await executeDripsReadMethod({
        functionName: 'splittable',
        args: [toBigInt(accountId), ta as OxString],
      })
    ).map((sb) => ({
      tokenAddress: ta,
      splittableAmount: toBigInt(sb),
    })),
  );
}

async function getReceivableBalanceForUser(
  accountId: string,
  tokenAddress: string,
  maxCycles: number,
) {
  return single(
    (
      await executeDripsReadMethod({
        functionName: 'receiveStreamsResult',
        args: [toBigInt(accountId), tokenAddress as OxString, maxCycles],
      })
    ).map((rb) => ({
      tokenAddress,
      receivableAmount: toBigInt(rb),
    })),
  );
}

async function getCollectableBalanceForUser(accountId: string, tokenAddress: string) {
  return single(
    (
      await executeDripsReadMethod({
        functionName: 'collectable',
        args: [toBigInt(accountId), tokenAddress as OxString],
      })
    ).map((cb) => ({
      tokenAddress,
      collectableAmount: toBigInt(cb),
    })),
  );
}
