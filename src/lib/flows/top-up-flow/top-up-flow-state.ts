import { writable } from 'svelte/store';

export interface TopUpFlowState {
  tokenAddress?: string;
  tokenAllowance?: bigint;
  tokenBalance?: bigint;
  amountToTopUp?: bigint;
}

export default (tokenAddress: string | undefined) =>
  writable<TopUpFlowState>({
    tokenAddress,
  });
