import { makeStep } from '$lib/components/stepper/types';
import { writable } from 'svelte/store';
import FetchListWeights from './fetch-list-weights.svelte';
import type { Items, Weights } from '$lib/components/list-editor/types';
import ReviewList from './review-list.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';

export interface State {
  weights: Weights | null;
  items: Items | null;
}

export default (roundSlug: string, roundName: string) => {
  const state = writable<State>({
    weights: null,
    items: null,
  });

  return {
    context: () => state,
    steps: [
      makeStep({
        component: FetchListWeights,
        props: {
          roundSlug,
        },
      }),
      makeStep({
        component: ReviewList,
        props: {
          roundSlug,
          roundName,
        },
      }),
      makeStep({
        component: SuccessStep,
        props: {
          message:
            'Your new Drip List has been created and linked to the round. It is now publicly visible and may be funded by anyone.',
          action: 'link',
          linkText: 'View your round',
          href: () => `/app/rpgf/rounds/${roundSlug}`,
        },
      }),
    ],
  };
};
