import { makeStep } from '$lib/components/stepper/types';
import { writable } from 'svelte/store';
import EnterKycInformation from './enter-kyc-information.svelte';
import Success from './success.svelte';

export interface State {
  kycFormUrl: string | null;
}

export default (applicationId: string) => {
  const state = writable<State>({
    kycFormUrl: null,
  });

  return {
    context: () => state,
    steps: [
      makeStep({
        component: EnterKycInformation,
        props: {
          applicationId,
        },
      }),
      makeStep({
        component: Success,
        props: undefined,
      }),
    ],
  };
};
