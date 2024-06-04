import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import createStreamFlowState from './create-stream-flow-state';
import InputDetails from './input-details.svelte';
import type {
  CreateStreamFlowAddressDriverAccountFragment,
  CreateStreamFlowDetailsNftDriverAccountFragment,
} from './__generated__/gql.generated';
import FetchData from './fetch-data.svelte';

export default (
  tokenAddress?: string,
  receiver?:
    | CreateStreamFlowDetailsNftDriverAccountFragment
    | CreateStreamFlowAddressDriverAccountFragment,
) => ({
  context: () => createStreamFlowState(receiver, tokenAddress),
  steps: [
    makeStep({
      component: FetchData,
      props: undefined,
    }),
    makeStep({
      component: InputDetails,
      props: undefined,
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your stream has been successfully created. ' +
          'Please note that it may take a while for your dashboard to update.',
      },
    }),
  ],
});
