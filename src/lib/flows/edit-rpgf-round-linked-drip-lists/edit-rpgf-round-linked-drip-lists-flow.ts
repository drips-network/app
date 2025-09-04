import type { DripListItem } from '$lib/components/list-editor/types';
import { makeStep } from '$lib/components/stepper/types';
import ChooseLinkedLists from './choose-linked-lists.svelte';

export default (roundId: string, dripLists: DripListItem['dripList'][]) => ({
  steps: [
    makeStep({
      component: ChooseLinkedLists,
      props: {
        roundId,
        linkedDripLists: dripLists,
      },
    }),
  ],
});
