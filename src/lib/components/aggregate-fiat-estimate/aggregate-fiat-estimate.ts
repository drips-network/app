import tokensStore from '$lib/stores/tokens/tokens.store';
import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
import { get } from 'svelte/store';

export interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export default function aggregateFiatEstimate(
  priceStore: ReturnType<typeof fiatEstimates.price>,
  amounts: Amount[],
) {
  const prices = get(priceStore);

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

      const res = fiatEstimates.convert({ amount, tokenAddress }, token.info.decimals);

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
