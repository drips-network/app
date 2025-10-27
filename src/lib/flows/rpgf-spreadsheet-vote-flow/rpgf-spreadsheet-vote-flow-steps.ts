import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { Round } from '$lib/utils/rpgf/types/round';
import type { Writable } from 'svelte/store';
import UploadBallot from './upload-ballot.svelte';
import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';

export default (
  round: Round,
  inProgressBallot: Writable<InProgressBallot> & { clear: () => void },
) => ({
  steps: [
    makeStep({
      component: UploadBallot,
      props: { round, inProgressBallot },
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
