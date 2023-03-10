import { newRestorer, type Restorer } from '$lib/utils/restorer';
import { writable } from 'svelte/store';

type Restorable = {
  streamNameValue: string | undefined;
  amountValue: string | undefined;
  selectedTokenAddress: string[] | undefined;
  selectedMultiplier: string;
  recipientAddressValue: string | undefined;
  streamStartDateValue: string | undefined;
  streamStartTimeValue: string | undefined;
  streamEndDateValue: string | undefined;
  streamEndTimeValue: string | undefined;
  setStartAndEndDate: boolean;
};

export interface CreateStreamFlowState {
  restorer: Restorer<Restorable>;
}

export default () =>
  writable<CreateStreamFlowState>({
    restorer: newRestorer<Restorable>({ selectedMultiplier: '1', setStartAndEndDate: false }),
  });
