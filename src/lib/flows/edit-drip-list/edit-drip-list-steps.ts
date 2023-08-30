import type { Splits } from '$lib/components/splits/splits.svelte';
import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import EditDripListStep from './steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { GitProject } from '$lib/utils/metadata/types';

export default (
  dripListId: string,
  listName: string,
  listDescription: string,
  representationalSplits: Splits,
  projectToAdd?: GitProject,
) => ({
  context: undefined,
  steps: [
    makeStep({
      component: EditDripListStep,
      props: {
        projectToAdd,
        dripListId,
        representationalSplits,
        listName,
        listDescription,
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
