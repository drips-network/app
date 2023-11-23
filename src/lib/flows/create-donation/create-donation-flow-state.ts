import { writable } from 'svelte/store';

export interface CreateDonationFlowState {
  selectedTokenAddress: string[] | undefined;
  amountInputValue: string;
  topUpMax: boolean;
}

export default () =>
  writable<CreateDonationFlowState>({
    selectedTokenAddress: undefined,
    amountInputValue: '0',
    topUpMax: false,
  });
