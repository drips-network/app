import { makeStep } from '$lib/components/stepper/types';
import PickKycRequest from './pick-kyc-request.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { KycRequest } from '$lib/utils/rpgf/types/kyc';
import { writable } from 'svelte/store';
import FetchKycRequests from './fetch-kyc-requests.svelte';

export interface State {
  kycRequests: KycRequest[];
}

export default (applicationId: string, roundId: string) => {
  const state = writable<State>({
    kycRequests: [],
  });

  return {
    context: () => state,
    steps: [
      makeStep({
        component: FetchKycRequests,
        props: {
          roundId,
        },
      }),
      makeStep({
        component: PickKycRequest,
        props: {
          applicationId,
        },
      }),
      makeStep({
        component: SuccessStep,
        props: {
          message: 'The existing KYC has been successfully linked to the application.',
        },
      }),
    ],
  };
};
