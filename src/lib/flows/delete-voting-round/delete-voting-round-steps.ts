import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
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
    makeStep({
      component: SuccessStep,
      props: {
        message: 'Your voting round has successfully been deleted.',
      },
    }),
  ],
});
