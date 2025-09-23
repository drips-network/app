import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import PublishRpgfRoundStep from './publish-rpgf-round-step.svelte';

export default (draftId: string) => ({
  context: undefined,
  steps: [
    makeStep({
      component: PublishRpgfRoundStep,
      props: {
        draftId,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        message: 'Your RPGF round has successfully been published.',
      },
    }),
  ],
});
