import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get, writable } from 'svelte/store';
import EditDripListStep from '../shared/steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { DripList, GitProject } from '$lib/utils/metadata/types';
import SelectDripList from './steps/select-drip-list.svelte';
import type { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
import assert from '$lib/utils/assert';
import unreachable from '$lib/utils/unreachable';

export default (
  /** The current user's Drip Lists. */
  dripLists: DripList[],
  projectToAdd?: GitProject,
  dripListToAdd?: DripList,
) => {
  const selectedDripListState = writable<{
    dripList: DripList | undefined;
    representationalSplits:
      | Awaited<ReturnType<typeof getRepresentationalSplitsForAccount>>
      | undefined;
  }>(undefined);

  assert(
    projectToAdd || dripListToAdd,
    'Must provide either a project or a drip list to add to the drip list.',
  );

  return {
    context: undefined,
    steps: [
      makeStep({
        component: SelectDripList,
        props: {
          dripLists,
          selectedDripListState,
          projectOrDripListToAdd: projectToAdd ?? dripListToAdd ?? unreachable(),
        },
      }),
      makeStep({
        component: EditDripListStep,
        props: {
          projectToAdd,
          dripListToAdd,
          selectedDripListState,
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
  };
};
