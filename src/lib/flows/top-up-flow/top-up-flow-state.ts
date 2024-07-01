import { writable } from 'svelte/store';

export interface TopUpFlowState {
  tokenAddress?: string;
  tokenAllowance?: bigint;
  tokenBalance?: bigint;
  amountValue: string;
  amountToTopUp?: bigint;
  topUpMax: boolean;
}

export default (tokenAddress: string | undefined) =>
  writable<TopUpFlowState>({
    tokenAddress,
    amountValue: '',
    topUpMax: false,
  });
