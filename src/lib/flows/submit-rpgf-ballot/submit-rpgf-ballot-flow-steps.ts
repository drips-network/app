import { makeStep } from '$lib/components/stepper/types';
import type { InProgressBallot } from '$lib/utils/rpgf/schemas';
import type { Writable } from 'svelte/store';
import Confirm from './steps/confirm.svelte';
import Success from './steps/success.svelte';

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
      component: Success,
      props: {
        roundSlug,
      },
    }),
  ],
});
