import { makeStep } from '$lib/components/stepper/types';
import { writable } from 'svelte/store';
import FetchListWeights from './fetch-list-weights.svelte';
import type { Items, Weights } from '$lib/components/list-editor/types';
import ReviewList from './review-list.svelte';
import Success from './success.svelte';

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
        component: Success,
        props: {
          roundSlug,
        },
      }),
    ],
  };
};
