import { makeStep } from '$lib/components/stepper/types';
import type { Vote } from '$lib/utils/multiplayer/schemas';
import ViewVote from './view-vote.svelte';

export default (vote: Vote) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ViewVote,
      props: {
        vote,
      },
    }),
  ],
});
