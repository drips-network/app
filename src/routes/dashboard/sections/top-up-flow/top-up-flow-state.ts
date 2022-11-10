import { writable } from 'svelte/store';

export interface TopUpFlowState {
  tokenAddress?: string;
  tokenAllowance?: bigint;
  amountToTopUp?: bigint;
}

export default writable<TopUpFlowState>({});
