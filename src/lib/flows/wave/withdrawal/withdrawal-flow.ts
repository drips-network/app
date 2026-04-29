import { makeStep } from '$lib/components/stepper/types';
import type { GrantDto, StellarMemoType } from '$lib/utils/wave/types/grant';
import { writable } from 'svelte/store';
import EnterAddress from './enter-address.svelte';
import Confirm from './confirm.svelte';
import Success from './success.svelte';

export interface State {
  stellarAddress: string;
  memo?: string;
  memoType?: StellarMemoType;
}

export interface PrefillData {
  stellarAddress?: string;
  memo?: string;
}

export interface KybData {
  stellarAddress: string;
  memoType: StellarMemoType | null;
  memoValue: string | null;
}

export default (grant: GrantDto, prefill?: PrefillData, kyb?: KybData) => {
  const state = writable<State>({
    stellarAddress: kyb?.stellarAddress ?? prefill?.stellarAddress ?? '',
    memo: kyb?.memoValue ?? prefill?.memo,
    memoType: kyb?.memoType ?? undefined,
  });

  return {
    context: () => state,
    steps: [
      makeStep({
        component: EnterAddress,
        props: { grant, prefill, kyb },
      }),
      makeStep({
        component: Confirm,
        props: { grant, kyb },
      }),
      makeStep({
        component: Success,
        props: {},
      }),
    ],
  };
};
