import { newRestorer, type Restorer } from '$lib/utils/restorer';
import { writable } from 'svelte/store';

type Restorable = {
  recipientInputValue: string | undefined;
  selectedTokenAddress: string[] | undefined;
  amountInputValue: string;
  topUpMax: boolean;
};

export interface CreateDonationFlowState {
  restorer: Restorer<Restorable>;
}

export default () =>
  writable<CreateDonationFlowState>({
    restorer: newRestorer<Restorable>({ amountInputValue: '0', topUpMax: false }),
  });
