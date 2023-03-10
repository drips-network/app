import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import editSplitsFlowState from './edit-splits-flow-state';
import EditSplitsInputs from './edit-splits-inputs.svelte';
import FetchSplits from './fetch-splits.svelte';

export default (afterTx: () => Promise<void>) => ({
  context: () => editSplitsFlowState,
  steps: [
    makeStep({
      component: FetchSplits,
      props: undefined,
    }),
    makeStep({
      component: EditSplitsInputs,
      props: {
        afterTx,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your splits have been updated. ' +
          'It may take some time to see the changes in your dashboard.',
      },
    }),
  ],
});
