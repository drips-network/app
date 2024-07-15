import { gql } from 'graphql-request';
import type { MergeWithdrawableBalancesFragment } from './__generated__/gql.generated';
import mergeAmounts from './amounts/merge-amounts';

export const MERGE_WITHDRAWABLE_BALANCES_FRAGMENT = gql`
  fragment MergeWithdrawableBalances on WithdrawableBalance {
    tokenAddress
    collectableAmount
    receivableAmount
    splittableAmount
  }
`;

interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export function mergeCollectableFunds(withdrawableBalances: MergeWithdrawableBalancesFragment[]) {
  const amounts: Amount[] = withdrawableBalances.map(({ tokenAddress, collectableAmount }) => ({
    tokenAddress,
    amount: BigInt(collectableAmount),
  }));

  return mergeAmounts(amounts);
}

export function mergeSplittableFunds(withdrawableBalances: MergeWithdrawableBalancesFragment[]) {
  const amounts: Amount[] = withdrawableBalances.map(({ tokenAddress, splittableAmount }) => ({
    tokenAddress,
    amount: BigInt(splittableAmount),
  }));

  return mergeAmounts(amounts);
}

export function mergeReceivableFunds(withdrawableBalances: MergeWithdrawableBalancesFragment[]) {
  const amounts: Amount[] = withdrawableBalances.map(({ tokenAddress, receivableAmount }) => ({
    tokenAddress,
    amount: BigInt(receivableAmount),
  }));

  return mergeAmounts(amounts);
}

export default function mergeWithdrawableBalances(
  withdrawableBalances: MergeWithdrawableBalancesFragment[],
  excludeReceivable = false,
) {
  return mergeAmounts(
    mergeCollectableFunds(withdrawableBalances),
    mergeSplittableFunds(withdrawableBalances),
    excludeReceivable ? [] : mergeReceivableFunds(withdrawableBalances),
  );
}
