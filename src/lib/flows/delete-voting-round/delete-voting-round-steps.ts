import { makeStep } from '$lib/components/stepper/types';
import Confirm from './confirm.svelte';

export default (votingRoundId: string) => ({
  context: undefined,
  steps: [
    makeStep({
      component: Confirm,
      props: {
        votingRoundId,
      },
    }),
  ],
});
