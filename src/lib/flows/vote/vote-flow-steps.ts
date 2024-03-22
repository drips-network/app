import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
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
    makeStep({
      component: SuccessStep,
      props: {
        message: 'Your vote has been successfully submitted.',
      },
    }),
  ],
});
