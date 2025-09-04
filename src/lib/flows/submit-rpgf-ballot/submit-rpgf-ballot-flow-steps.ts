import { makeStep } from '$lib/components/stepper/types';
import type { Writable } from 'svelte/store';
import Confirm from './steps/confirm.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { Round } from '$lib/utils/rpgf/types/round';
import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';

export default (
  ballot: Writable<InProgressBallot> & { clear: () => void },
  round: Round,
  previouslyCastBallot: boolean,
) => ({
  steps: [
    makeStep({
      component: Confirm,
      props: {
        ballot,
        roundId: round.id,
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
        href: () => `/app/rpgf/rounds/${round.urlSlug}`,
      },
    }),
  ],
});
