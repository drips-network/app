import { makeStep } from '$lib/components/stepper/types';
import type { GrantDto } from '$lib/utils/wave/types/grant';
import { writable } from 'svelte/store';
import EnterAddress from './enter-address.svelte';
import Confirm from './confirm.svelte';
import Success from './success.svelte';

export interface State {
  stellarAddress: string;
}

export default (grant: GrantDto) => {
  const state = writable<State>({
    stellarAddress: '',
  });

  return {
    context: () => state,
    steps: [
      makeStep({
        component: EnterAddress,
        props: { grant },
      }),
      makeStep({
        component: Confirm,
        props: { grant },
      }),
      makeStep({
        component: Success,
        props: {},
      }),
    ],
  };
};
