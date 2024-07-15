import { writable } from 'svelte/store';
import type { WithdrawFlowEnterAmountStepBalancesFragment } from './__generated__/gql.generated';

export interface WithdrawFlowState {
  tokenAddress: string;
  amountToWithdraw: bigint | undefined;
  withdrawAll: boolean;
  amount: string | undefined;
  userOutgoingTokenBalances: WithdrawFlowEnterAmountStepBalancesFragment[];
}

export default (tokenAddress: string) =>
  writable<WithdrawFlowState>({
    tokenAddress,
    amountToWithdraw: undefined,
    withdrawAll: false,
    amount: undefined,
    userOutgoingTokenBalances: [],
  });
