import { writable } from 'svelte/store';

export interface ManageStreamingBalanceFlowState {
  tokenAddress?: string;
  tokenAllowance?: bigint;
  tokenBalance?: bigint;
  amountToTopUp?: bigint;
  amountToWithdraw?: bigint;
}

export default writable<ManageStreamingBalanceFlowState>({});
