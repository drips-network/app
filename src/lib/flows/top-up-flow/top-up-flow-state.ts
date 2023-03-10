import { newRestorer, type Restorer } from '$lib/utils/restorer';
import { writable } from 'svelte/store';

type Restorable = {
  amountValue: string;
  topUpMax: boolean;
};
export interface TopUpFlowState {
  tokenAddress?: string;
  tokenAllowance?: bigint;
  tokenBalance?: bigint;
  amountToTopUp?: bigint;
  restorer: Restorer<Restorable>;
}

export default (tokenAddress: string | undefined) =>
  writable<TopUpFlowState>({
    restorer: newRestorer<Restorable>({ amountValue: '0', topUpMax: false }),
    tokenAddress,
  });
