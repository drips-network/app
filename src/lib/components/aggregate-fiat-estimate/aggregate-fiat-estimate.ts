import tokensStore from '$lib/stores/tokens/tokens.store';
import fiatEstimates, { type Prices } from '$lib/utils/fiat-estimates/fiat-estimates';
import { derived, type Readable } from 'svelte/store';

export interface Amount {
  tokenAddress: string;
  amount: bigint | string;
}

export default function aggregateFiatEstimate(prices: Prices, amounts: Amount[]) {
  let includesUnknownPrice = false;
  let fiatEstimateCents: number | 'pending' = 'pending';

  if (Object.values(prices).includes('pending')) {
    fiatEstimateCents = 'pending';
  } else {
    fiatEstimateCents = amounts.reduce((sum, { tokenAddress, amount }) => {
      const token = tokensStore.getByAddress(tokenAddress);

      if (!token) {
        includesUnknownPrice = true;
        return sum;
      }

      const bigIntAmount = BigInt(amount);

      const res = fiatEstimates.convert(
        { amount: bigIntAmount, tokenAddress },
        token.info.decimals,
        prices,
      );

      if (res === 'unsupported') {
        includesUnknownPrice = true;
        return sum;
      }

      if (!res || res === 'pending') {
        return sum;
      }

      return sum + res;
    }, 0);
  }

  return {
    fiatEstimateCents,
    includesUnknownPrice,
  };
}

export function aggregateFiatEstimateReadable(
  priceStore: Readable<Prices> | undefined,
  amounts: Amount[],
) {
  if (!priceStore) {
    return derived([], () => {
      return aggregateFiatEstimate({}, amounts);
    });
  }

  return derived([priceStore], ([$prices]) => {
    return aggregateFiatEstimate($prices, amounts);
  });
}
