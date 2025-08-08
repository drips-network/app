import { makeStep } from '$lib/components/stepper/types';
import type { InProgressBallot } from '$lib/utils/rpgf/schemas';
import type { Writable } from 'svelte/store';
import Confirm from './steps/confirm.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';

export default (
  ballot: Writable<InProgressBallot> & { clear: () => void },
  roundSlug: string,
  previouslyCastBallot: boolean,
) => ({
  steps: [
    makeStep({
      component: Confirm,
      props: {
        ballot,
        roundSlug,
        previouslyCastBallot,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        message:
          'Your ballot has successfully been submitted. You can view and make edits until voting closes.',
        action: 'link',
        linkText: 'Back to the round',
        href: () => `/app/rpgf/rounds/${roundSlug}`,
      },
    }),
  ],
});
