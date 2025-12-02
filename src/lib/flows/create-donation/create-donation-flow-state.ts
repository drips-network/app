import { writable } from 'svelte/store';

export interface CreateDonationFlowState {
  selectedTokenAddress: string[];
  amountInputValue: string;
}

export default () =>
  writable<CreateDonationFlowState>({
    selectedTokenAddress: [],
    amountInputValue: '0',
  });
