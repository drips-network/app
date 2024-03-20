import { makeStep } from '$lib/components/stepper/types';
import Vote from './vote.svelte';

export default (votingRoundId: string) => ({
  context: undefined,
  steps: [
    makeStep({
      component: Vote,
      props: {
        votingRoundId,
      },
    }),
  ],
});
