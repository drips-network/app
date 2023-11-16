import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get, writable } from 'svelte/store';
import EditDripListStep from '../shared/steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { EditDripListStepSelectedDripListFragment } from '../shared/steps/__generated__/gql.generated';

export default (
  dripList: EditDripListStepSelectedDripListFragment,
) => ({
  context: undefined,
  steps: [
    makeStep({
      component: EditDripListStep,
      props: {
        selectedDripListState: writable({
          dripList,
        }),
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your Drip List has been updated. Please refresh your dashboard to see the changes.',
      },
    }),
  ],
});
