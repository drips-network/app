import { writable } from 'svelte/store';

export interface WithdrawFlowState {
  tokenAddress: string;
  amountToWithdraw?: bigint;
}

export default (tokenAddress: string) => writable<WithdrawFlowState>({ tokenAddress });
