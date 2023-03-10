import { newRestorer, type Restorer } from '$lib/utils/restorer';
import { writable } from 'svelte/store';

type Restorable = {
  withdrawAll: boolean;
  amount: string | undefined;
};

export interface WithdrawFlowState {
  tokenAddress: string;
  amountToWithdraw?: bigint;
  restorer: Restorer<Restorable>;
}

export default (tokenAddress: string) =>
  writable<WithdrawFlowState>({
    tokenAddress,
    restorer: newRestorer<Restorable>({ withdrawAll: false }),
  });
