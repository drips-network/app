import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get, writable } from 'svelte/store';
import EditDripListStep from '../shared/steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { DripList } from '$lib/utils/metadata/types';
import type { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';

export default (
  dripList: DripList,
  representationalSplits: Awaited<ReturnType<typeof getRepresentationalSplitsForAccount>>,
) => ({
  context: undefined,
  steps: [
    makeStep({
      component: EditDripListStep,
      props: {
        selectedDripListState: writable({
          dripList,
          representationalSplits,
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
