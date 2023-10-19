import type { Splits } from '$lib/components/splits/splits.svelte';
import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import EditDripListStep from './steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { DripList } from '$lib/utils/metadata/types';
import type { Project } from '$lib/graphql/generated/graphql';

export default (
  dripListId: string,
  listName: string,
  listDescription: string | undefined,
  representationalSplits: Splits,
  projectToAdd?: Project,
  dripListToAdd?: DripList,
) => ({
  context: undefined,
  steps: [
    makeStep({
      component: EditDripListStep,
      props: {
        projectToAdd,
        dripListToAdd,
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
