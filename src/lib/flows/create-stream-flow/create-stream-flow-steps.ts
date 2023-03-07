import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import InputDetails from './input-details.svelte';

export default (tokenAddress?: string) => ({
  context: undefined,
  steps: [
    makeStep({
      component: InputDetails,
      props: {
        tokenAddress,
      },
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
