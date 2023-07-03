import type { Splits } from '$lib/components/splits/splits.svelte';
import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import EditDripListStep from './steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';

export default (dripListId: string, representationalSplits: Splits) => ({
  context: undefined,
  steps: [
    makeStep({
      component: EditDripListStep,
      props: {
        dripListId,
        representationalSplits,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your Drip List has been updated. Please note that it may take some time for your dashboard to update.',
      },
    }),
  ],
});
