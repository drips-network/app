import { writable } from 'svelte/store';
import type {
  CreateStreamFlowAddressDriverAccountFragment,
  CreateStreamFlowDetailsNftDriverAccountFragment,
  CreateStreamFlowEcosystemAccountFragment,
  CreateStreamFlowOrcidAccountFragment,
} from './__generated__/gql.generated';
import type { CurrentAmountsUserBalanceTimelineItemFragment } from '$lib/utils/__generated__/gql.generated';

export interface CreateStreamFlowState {
  streamNameValue: string | undefined;
  recipientInputValue: string | undefined;
  selectedTokenAddress: string[];
  amountValue: string | undefined;
  selectedMultiplier: string;
  streamStartDateValue: string | undefined;
  streamStartTimeValue: string | undefined;
  streamEndDateValue: string | undefined;
  streamEndTimeValue: string | undefined;
  setStartAndEndDate: boolean;
  userOutgoingTokenBalances: {
    tokenAddress: string;
    outgoing: CurrentAmountsUserBalanceTimelineItemFragment[];
  }[];
  receiver:
    | CreateStreamFlowAddressDriverAccountFragment
    | CreateStreamFlowDetailsNftDriverAccountFragment
    | CreateStreamFlowEcosystemAccountFragment
    | CreateStreamFlowOrcidAccountFragment
    | undefined;
}

export default (
  receiver:
    | CreateStreamFlowAddressDriverAccountFragment
    | CreateStreamFlowDetailsNftDriverAccountFragment
    | CreateStreamFlowEcosystemAccountFragment
    | CreateStreamFlowOrcidAccountFragment
    | undefined,
  selectedTokenAddress: string | undefined,
) =>
  writable<CreateStreamFlowState>({
    streamNameValue: undefined,
    recipientInputValue: undefined,
    selectedTokenAddress: selectedTokenAddress ? [selectedTokenAddress] : [],
    amountValue: undefined,
    selectedMultiplier: '1',
    setStartAndEndDate: false,
    streamStartDateValue: undefined,
    streamStartTimeValue: undefined,
    streamEndDateValue: undefined,
    streamEndTimeValue: undefined,
    userOutgoingTokenBalances: [],
    receiver,
  });
