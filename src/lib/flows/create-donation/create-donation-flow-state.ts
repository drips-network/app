import { writable } from 'svelte/store';

export interface CreateDonationFlowState {
  selectedTokenAddress: string[];
  amountInputValue: string;
  topUpMax: boolean;
}

export default () =>
  writable<CreateDonationFlowState>({
    selectedTokenAddress: [],
    amountInputValue: '0',
    topUpMax: false,
  });
