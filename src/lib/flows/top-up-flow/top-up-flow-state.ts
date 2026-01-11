import { writable } from 'svelte/store';

export interface TopUpFlowState {
  tokenAddress?: string;
  tokenAllowance?: bigint;
  tokenBalance?: bigint;
  autoWrap?: boolean;
  autoWrapPair?: import('$lib/stores/wallet/network').AutoUnwrapPair;
  amountValue: string;
  amountToTopUp?: bigint;
}

export default (tokenAddress: string | undefined) =>
  writable<TopUpFlowState>({
    tokenAddress,
    amountValue: '',
  });
